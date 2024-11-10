#!/usr/bin/env python

import base64
import logging
import tempfile

from flask import Flask, jsonify, request

from beamer import just_bim_it

#------------------------------------------------------------------------------

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

app = Flask(__name__)

#------------------------------------------------------------------------------

@app.route("/beamer", methods=["POST"])
def summarize():
    request_json = request.get_json()
    input_file_content = request_json.get("file")

    logging.info(f"Received {input_file_content[:10]}...")
    
    input_file_decoded = base64.b64decode(input_file_content)
    with tempfile.NamedTemporaryFile(mode="+br") as input_file:
        input_file.write(input_file_decoded)
        stuff = just_bim_it(input_file.name)

    logging.info("BIMed it")

    return jsonify(stuff)

#------------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0")

#------------------------------------------------------------------------------
