import requests
import matplotlib.pyplot as plt
from VC_data_getter import VC_data_getter
import numpy as np

vdg = VC_data_getter()

"""
Get different tags of the nuortenideat palvelu
"""
tags_json = vdg.get_nuortenideat_tags()
tags_fi = []
tags_sv = []
for tag in tags_json["results"]:
	tags_fi.append(tag["name"]["fi"])
	tags_sv.append(tag["name"]["sv"])

"""
Fetch all the ideas associated with each tag
"""
num_ideas_tags = []
try:
	for i in range(len(tags_fi)):
		page = 1
		while True:
			"""request returns paginated lists of 50 items, which is why they have to be
			gone throught until empty list is returned"""
			ideas = vdg.get_nuortenideat_by_tag(i+1, page)
			"""Empty list causes beark from the loop"""
			if ideas == -1:
				break
			elif(len(num_ideas_tags) == i):
				num_ideas_tags.append(len(ideas["results"]))
			else:
				num_ideas_tags[i] += len(ideas["results"])
			page += 1
except Exception as e:
	print("Error:", e)


"""
Plot the nuortenideat by tags bar chart
"""
y_pos = np.arange(len(tags_fi))
plt.barh(y_pos, num_ideas_tags, align="center", alpha=0.5)
plt.yticks(y_pos, tags_fi)
plt.xlabel("Number of ideas")
plt.title("Number of ideas for each tag in nuortenideat")

plt.show()