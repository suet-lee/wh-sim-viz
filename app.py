from pathlib import Path
import sys
import os
import subprocess
import shutil

DIR_ROOT = Path(__file__).resolve().parents[0]
from src import *

from flask import Flask, request, render_template, redirect, jsonify
import json
import yaml

###### Setup #####

app = Flask(__name__, static_url_path='/s/', static_folder='static')

####################

def render_page(template, data):
    return render_template(template, data=data)

@app.route("/")
@app.route("/<controller>/")
def viz(controller="random-walk"):
    if controller == "rates":
        return render_page('rates.html', {"controller": controller})

    return render_page('main.html', {"controller": controller})

@app.route("/get-data/<controller>", methods = ['GET'])
def data(controller):
    if request.method == "GET":
        data_dir_path = os.path.join(DIR_ROOT, "data", controller)
        data = getSimData(data_dir_path)
        return json.dumps(data)

def getSimData(dir_path):
    d_out = {}
    for fname in G_DATA_FILES:
        dir_path_ = os.path.join(dir_path, fname)
        if fname in ["dtags.txt", "metadata.txt"]:
            read_as_dict = True
        else:
            read_as_dict = False
        try:
            d = Data(filepath=dir_path_, read_as_dict=read_as_dict)
            key = fname.split(".")[0]
            d_out[key] = d.data
        except:
            print("File not found: %s"%fname)
    return d_out

CTRL_ID = {
    'random-walk': 1,
    'diffusion-taxis': 2,
    'collective-transport': 3
}

@app.route("/run-sim/<controller>", methods = ['POST'])
def run_sim(controller):
    if request.method == "POST":
        exe = "viz_sim "
        cmd_str = "cd src && ./"+exe
        cmd_str += generate_cmd(request.get_data(), controller)
        print(cmd_str)
        try:
            proc = subprocess.run(cmd_str, shell=True)
        except Exception as e:
            print(e)
            return e, 500

        for f in G_DATA_FILES:
            fpath = os.path.join("src", f)
            new_fpath = os.path.join("data", controller, f)
            try:
                shutil.move(fpath, new_fpath)
            except Exception as e:
                print("error moving file: %s"%f)
                print(e)
                
        return "", 200

def generate_cmd(data, controller):
    data_a = data.decode("utf-8").split('&')
    cmd_a = []
    metr = []
    compute_metr = False
    
    for it in data_a:
        try:
            it_a = it.split('=')
            if it_a[0] == "diagnosis" and it_a[1] == "1":
                cmd_a.append("--diagnosis-active")
                continue

            cmd_a.append("-"+" ".join(it_a))
            if it_a[0] == "mid":
                if int(it_a[1]) in [5,10]:
                    metr.append(11)
                    compute_metr = True
                if int(it_a[1]) in [6,11]:
                    metr.append(9)
                    compute_metr = True
                if int(it_a[1]) in [7,12]:
                    metr.append(10)
                    compute_metr = True
                if int(it_a[1]) in [8,13]:
                    metr.append(12)
                    compute_metr = True
            if it_a[0] == "bbias":
                metr.append(35)
                compute_metr = True
        except Exception as e:
            print(e)
    
    if compute_metr:
        cmd_a += ["--compute-metr", str(metr)]
        
    return " ".join(cmd_a)
    
app.run(port=5000, debug=True)