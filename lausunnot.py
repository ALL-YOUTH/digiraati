import requests
import matplotlib.pyplot as plt
from VC_data_getter import VC_data_getter
import numpy as np
from matplotlib import colors as mcolors
import random
import datetime

vdg = VC_data_getter()

lausunnot = vdg.get_lausuntopalvelu_all()
current_date = datetime.datetime.now()
now = current_date.isoformat()

open = []
closed = []
try:
    for lausunto in lausunnot:
        """Deadline larger than current datetime => Open"""
        if lausunto["content"]["m:properties"]["d:Deadline"]["#text"] > now:
            open.append(lausunto)
        else:
            closed.append(lausunto)

except Exception as e:
    print("Error:", e)

print("AVOIMET LAUSUNNOT:\n")
for lausunto in open:
    if(type(lausunto["content"]["m:properties"]["d:Name"])) is dict:
        print(lausunto["content"]["m:properties"]["d:Name"]["#text"])
    else:
        print(lausunto["content"]["m:properties"]["d:Name"])

