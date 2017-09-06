#!/usr/bin/env python3
# coding: utf-8

"""Get numbering plan from ofca and parse it into a clean json file"""

import pandas as pd
from urllib.request import urlretrieve

urlretrieve("http://www.ofca.gov.hk/filemanager/ofca/common/datagovhk/no_plan_en_tc.xlsx", "no_plan_en_tc.xlsx")
df = pd.read_excel(open("./no_plan_en_tc.xlsx",'rb'),sheetname='Tel#',header=1)

def removeHyphen(s):
    if isinstance(s,str):
        s = s.replace('-','')
    return s

#remove the hyphens
df[df.columns[0]] = df[df.columns[0]].apply(removeHyphen)
df[df.columns[1]] = df[df.columns[1]].apply(removeHyphen)

#remove the rows which is not start with int
df = df[df[df.columns[0]].apply(lambda x: str(x).isdigit())]

df.columns = ['start','end','length','special#','type','subtype','company','remark']

with open('phonebook.json','w') as f:
    f.write(df.to_json(orient='records'))
