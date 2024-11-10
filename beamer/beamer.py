import base64
import multiprocessing as mp
from pathlib import Path
import tempfile
from collections import defaultdict

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
from scipy.spatial.transform import Rotation

COLLISION_THRESHOLD=10

def filter_clashes(model, clashes, clash_type):
    
    filtered_clashes = []
    element_collision_count = {}  # Track the number of clashes each element has
    
    for i, clash in enumerate(clashes):
        element_a = model.by_id(clash.a.id())
        element_b = model.by_id(clash.b.id())
        
        if element_a.id() not in element_collision_count:
            element_collision_count[element_a.id()] = 0
        if element_b.id() not in element_collision_count:
            element_collision_count[element_b.id()] = 0
        
        element_collision_count[element_a.id()] += 1
        element_collision_count[element_b.id()] += 1
        
        if element_collision_count[element_a.id()] > COLLISION_THRESHOLD or element_collision_count[element_b.id()] > COLLISION_THRESHOLD:
            continue
        
        filtered_clashes.append(clash)
    
    return filtered_clashes

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
    clash_types = {
        "column_to_beam": {"elements": ("IfcColumn", "IfcBeam"), "color": (1.0, 0.0, 0.0)},
        "column_to_foundation": {"elements": ("IfcColumn", "IfcFooting"), "color": (0.0, 0.0, 1.0)},
        "wall_to_column": {"elements": ("IfcWall", "IfcColumn"), "color": (0.0, 1.0, 0.0)},
        "column_to_column": {"elements": ("IfcColumn", "IfcColumn"), "color": (1.0, 1.0, 0.0)},
        "beam_to_beam": {"elements": ("IfcBeam", "IfcBeam"), "color": (0.5, 0.0, 0.5)},
        "wall_to_foundation": {"elements": ("IfcWall", "IfcFooting"), "color": (0.0, 1.0, 1.0)},
        "wall_to_wall": {"elements": ("IfcWall", "IfcWall"), "color": (1.0, 0.5, 0.0)},
        "plate_to_beam": {"elements": ("IfcPlate", "IfcBeam"), "color": (1.0, 0.5, 0.0)},
        "plate_to_column": {"elements": ("IfcPlate", "IfcColumn"), "color": (1.0, 0.5, 0.0)}


    }

    clash_data = {
        "total_clashes": 0,
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

    vertices = defaultdict(
        lambda: [[(0.,0.,.5), (0.,.2,.5), (.2,.2,.5), (.2,0.,.5), (.1,.1,0.)]]
    )
    faces = [[(0,3,2,1), (0,1,4), (1,2,4), (2,3,4), (3,0,4)]]
    matrix = np.eye(4)

    surface_styles = {}
    for clash_type, properties in clash_types.items():
        color_rgb = properties["color"]
        
        # Create color rendering for each clash type
        surface_style = model.create_entity("IfcSurfaceStyle", Name=clash_type)
        color = model.create_entity(
            "IfcColourRgb", Name=clash_type, Red=color_rgb[0], Green=color_rgb[1], Blue=color_rgb[2]
        )
        surface_style.Styles = [color]  # Directly associate IfcColourRgb
        
        surface_styles[clash_type] = surface_style

    columns_in_column_to_plate_clashes = []

    # Process each clash type defined in clash_types dictionary
    for clash_type, properties in clash_types.items():
        element_a_type, element_b_type = properties["elements"]
        clashes = tree.clash_collision_many(
            model.by_type(element_a_type),
            model.by_type(element_b_type),
            allow_touching=True
        )
        clashes = filter_clashes(model, clashes, clash_type)

        if clash_type in ("column_to_plate", "beam_to_plate"):
            for i, collision in enumerate(clashes):
                columns_in_column_to_plate_clashes.append(collision.b.id())
            continue
        
        clash_data["total_clashes"] += len(clashes)
        representation = ifcopenshell.api.geometry.add_mesh_representation(
            model,
            context=body,
            vertices=vertices[clash_type],
            faces=faces
        )
        for item in representation.Items:
            styled_item = model.create_entity("IfcStyledItem", Item=item)
            styled_item.Styles = [surface_styles[clash_type]]
    
        for i, collision in enumerate(clashes):
            element_a = model.by_id(collision.a.id())
            element_b = model.by_id(collision.b.id())

            if (element_a.id() in columns_in_column_to_plate_clashes or
                element_b.id() in columns_in_column_to_plate_clashes):
                continue

            matrix[:,3][0:3] = list(collision.p1)
            element = ifcopenshell.api.root.create_entity(model, ifc_class="IfcProxy")
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
                "clash_id": f"{clash_type}_clash_{i}",
                "clash_type": clash_type,
                "marker_id": element.id(),
                "marker_global_id": element.GlobalId,
                "location": {
                    "x": collision.p1[0],
                    "y": collision.p1[1],
                    "z": collision.p1[2]
                },
                "element_a": {
                    "id": element_a.id(),
                    "global_id": element_a.GlobalId,
                    "material": get_element_material(element_a),
                    "size": get_element_size(element_a)
                },
                "element_b": {
                    "id": element_b.id(),
                    "global_id": element_b.GlobalId,
                    "material": get_element_material(element_b),
                    "size": get_element_size(element_b)
                }
            }
            clash_data["clashes"].append(clash_info)
    
    return clash_data

#------------------------------------------------------------------------------

def just_bim_it(input_file_path: Path) -> Dict:
    model = ifcopenshell.open(input_file_path)
    tree = ifcopenshell.geom.tree()
    
    settings = ifcopenshell.geom.settings()
    element_types = ["IfcBeam", "IfcColumn", "IfcFooting", "IfcWall", "IfcPlate"]
    elements = sum([model.by_type(element_type) for element_type in element_types], [])
    
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
