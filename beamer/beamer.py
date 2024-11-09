#!/usr/bin/env python

import click


@click.command(no_args_is_help=True)
@click.option("-i", required=True, type=click.File("r", encoding="utf-8", lazy=True),
              help="Input file (*.ifc)")
def main(**opts):
    print("foo")


if __name__ == "__main__":
    main()
