#!/usr/bin/env python

import base64
import json
from pathlib import Path

import click

#------------------------------------------------------------------------------

@click.command(no_args_is_help=True)
@click.option("--input-file", "-i", required=True, type=click.File("r"), help="Input file (.json)")
def main(**opts):
    input_file = opts["input_file"]
    input_file_contents = json.loads(Path(input_file.name).read_text())
    output_path = f"{Path(Path(input_file.name).stem).stem}.dec.ifc"
    with open(output_path, "wb") as output_file:
        output_file.write(base64.b64decode(input_file_contents["file"]))
    click.echo(output_path)

#------------------------------------------------------------------------------

if __name__ == "__main__":
    main()

#------------------------------------------------------------------------------
