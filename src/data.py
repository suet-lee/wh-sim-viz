from pathlib import Path
import os
import json

class Data:

    def __init__(self, filepath, read_as_dict=False):
        self.data = self.read_file(filepath, read_as_dict)

    def read_file(self, filepath, read_as_dict=False):
        with open(filepath, 'r') as f:
            data = f.readlines()

        data_ = []
        for it in data:
            try:
                row = json.loads(it.strip())
            except:
                row = []
                
            if type(row) is dict and not read_as_dict:
                data_.append(list(row.values()))
            else:
                data_.append(row)
        
        return data_
