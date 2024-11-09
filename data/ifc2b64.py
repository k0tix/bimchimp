#!/usr/bin/env python

import base64
import json
from pathlib import Path

import click

#------------------------------------------------------------------------------

@click.command(no_args_is_help=True)
@click.option("--input-file", "-i", required=True, type=click.File("rb"), help="Input file (.ifc)")
def main(**opts):
    input_file = opts["input_file"]
    output_path = f"{Path(input_file.name).stem}.enc.json"
    output_json = {"file": base64.b64encode(input_file.read()).decode("utf-8")}
    with open(output_path, "w") as output_file:
        json.dump(output_json, output_file)
    click.echo("Done.")

#------------------------------------------------------------------------------

if __name__ == "__main__":
    main()

#------------------------------------------------------------------------------
