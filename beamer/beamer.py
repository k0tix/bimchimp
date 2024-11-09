import base64
import multiprocessing as mp
from pathlib import Path
import tempfile

import ifcopenshell
import ifcopenshell.util.placement
import ifcopenshell.util.element
import ifcopenshell.geom
import ifcopenshell.api.root
import ifcopenshell.api.unit
import ifcopenshell.api.context
import ifcopenshell.api.project
import ifcopenshell.api.geometry
from typing import Dict

import ifcopenshell
import numpy as np

#------------------------------------------------------------------------------

def get_element_material(element: ifcopenshell.entity_instance) -> Dict:
    material_info = {"name": "Unknown", "properties": {}}
    if material := ifcopenshell.util.element.get_material(element):
        if hasattr(material, 'Name'):
            material_info["name"] = material.Name or "Unnamed"
        if hasattr(material, 'MaterialProperties'):
            for props in material.MaterialProperties:
                if hasattr(props, 'Properties'):
                    for prop in props.Properties:
                        if hasattr(prop, 'Name') and hasattr(prop, 'NominalValue'):
                            material_info["properties"][prop.Name] = prop.NominalValue.wrappedValue
    return material_info

#------------------------------------------------------------------------------

def get_element_size(element: ifcopenshell.entity_instance) -> Dict:
    size_info = {"length": None, "width": None, "height": None}
    
    psets = ifcopenshell.util.element.get_psets(element)
    
    for props in psets.values():
        for length_key in filter(lambda x: x in props, ['Length', 'LENGTH', 'OverallLength']):
            size_info["length"] = props[length_key]  
        for width_key in filter(lambda x: x in props, ['Width', 'WIDTH', 'OverallWidth']):
            size_info['width'] = props[width_key] 
        for height_key in filter(lambda x: x in props, ['Height', 'HEIGHT', 'OverallHeight']):
            size_info['height'] = props[height_key]
    
    if all(v is None for v in size_info.values()):
        settings = ifcopenshell.geom.settings()
        shape = ifcopenshell.geom.create_shape(settings, element)
        bbox = shape.bbox()
        size_info['length'] = bbox.diagonal
        size_info['width'] = bbox.xmax - bbox.xmin
        size_info['height'] = bbox.zmax - bbox.zmin
    
    return size_info

#------------------------------------------------------------------------------

def analyze_clashes(model: ifcopenshell.file, tree: ifcopenshell.geom.tree) -> Dict:
    clashes = tree.clash_collision_many(
        model.by_type("IfcBeam"),
        model.by_type("IfcColumn"),
        allow_touching=True
    )
    clash_data = {
        "total_clashes": len(clashes),
        "clashes": []
    }

    # Set up 3D context for visualization
    model3d = ifcopenshell.api.context.add_context(model, context_type="Model")
    body = ifcopenshell.api.context.add_context(
        model,
        context_type="Model", 
        context_identifier="Body", 
        target_view="MODEL_VIEW", 
        parent=model3d
    )

    vertices = [[(0.,0.,.5), (0.,.2,.5), (.2,.2,.5), (.2,0.,.5), (.1,.1,0.)]]
    faces = [[(0,1,2,3), (0,4,1), (1,4,2), (2,4,3), (3,4,0)]]
    representation = ifcopenshell.api.geometry.add_mesh_representation(
        model,
        context=body,
        vertices=vertices,
        faces=faces
    )
    matrix = np.eye(4)
    
    for i, collision in enumerate(clashes):
        column = model.by_id(collision.a.id())
        beam = model.by_id(collision.b.id())
        matrix[:,3][0:3] = list(collision.p1)
        element = ifcopenshell.api.root.create_entity(model, ifc_class="IfcWall")
        ifcopenshell.api.geometry.edit_object_placement(
            model,
            product=element, 
            matrix=matrix
        )
        ifcopenshell.api.geometry.assign_representation(
            model,
            product=element,
            representation=representation
        )
        clash_info = {
            "clash_id": f"clash_{i}",
            "marker_id": element.id(),
            "marker_global_id": element.GlobalId,
            "location": {
                "x": collision.p1[0],
                "y": collision.p1[1],
                "z": collision.p1[2]
            },
            "column": {
                "id": column.id(),
                "global_id": column.GlobalId,
                "material": get_element_material(column),
                "size": get_element_size(column)
            },
            "beam": {
                "id": beam.id(),
                "global_id": beam.GlobalId,
                "material": get_element_material(beam),
                "size": get_element_size(beam)
            }
        }
        clash_data["clashes"].append(clash_info)
    
    return clash_data

#------------------------------------------------------------------------------

def just_bim_it(input_file_path: Path) -> Dict:
    model = ifcopenshell.open(input_file_path)
    tree = ifcopenshell.geom.tree()
    
    settings = ifcopenshell.geom.settings()
    elements = model.by_type("IfcBeam") + model.by_type("IfcColumn")
    
    it = ifcopenshell.geom.iterator(
        settings,
        model,
        mp.cpu_count(),
        include=elements
    )
    if it.initialize():
        while True:
            tree.add_element(it.get())
            if not it.next():
                break
    
    clash_data = analyze_clashes(model, tree)
    
    output_json = {}
    output_json["metadata"] = clash_data["clashes"]
    with tempfile.NamedTemporaryFile() as output_file:
        model.write(output_file.name)
        output_json["file"] = base64.b64encode(output_file.read()).decode("utf-8")

    return output_json

#------------------------------------------------------------------------------
