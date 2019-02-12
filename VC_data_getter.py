import json
import os
import requests
import sys

TO_JSON_SUFFIX = "?format=json"
MYDIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(MYDIR, "req", "xmltodict"))

import xmltodict

"""
Virtual Council data getter for services:
	-Nuortenideat.fi
	-Lausuntopalvelut.fi
"""
class VC_data_getter:
	def __init__(self):
		
		self.urls = self.read_json_file(os.path.join(MYDIR, "common_urls.json"))
		self.headers = {'Content-type': 'application/json'}
	
	def read_json_file(self, path):
		try:
			with open(path) as f:
				raw = f.read()
				data = json.loads(raw)
				
		except Exception as e:
			print("Something went wrong (read_common_urls):", e)
			
		return data

	"""
	Fetches all idea data from nuortenideat
	"""
	def get_nuortenideat_all(self):
		url = os.path.join(	self.urls["nuortenideat"]["base"], 
							self.urls["nuortenideat"]["ideas"])
		url += TO_JSON_SUFFIX
		ideas = []
		for i in range(1,1000):
			url += "&page=" + str(i)
			r = requests.get(url, headers=self.headers)
			data = r.json()
			try:
				_c = data["detail"]
				break
			except Exception as e:
				ideas.extend(data["results"])
				
		return ideas
		
	def get_nuortenideat_by_id(self, id):
		url = str(id)
		url += TO_JSON_SUFFIX
		return self.get_request_json(url)
		
	def get_nuortenideat_tags(self):
		url = os.path.join( self.urls["nuortenideat"]["base"],
							self.urls["nuortenideat"]["tags"])
		url += TO_JSON_SUFFIX
		return self.get_request_json(url)
		
	def get_nuortenideat_by_tag(self, tag, page=1):
		url = os.path.join( self.urls["nuortenideat"]["base"],
							self.urls["nuortenideat"]["tags"],
							str(tag))
		url += "/ideas/"
		url += TO_JSON_SUFFIX
		url += "&page=" + str(page)
		return self.get_request_json(url)
		
	def get_lausuntopalvelu_all(self):
		url = os.path.join(	self.urls["lausuntopalvelu"]["base"], 
							self.urls["lausuntopalvelu"]["proposals"])
		return_xml = self.get_request_text(url)
		data = json.loads(json.dumps(xmltodict.parse(return_xml)))
		return data["feed"]["entry"]
		
	def get_request_json(self, url):		
		r = requests.get(url, headers=self.headers)
		if(r.status_code == 404):
			return -1
		return r.json()
		
	def get_request_text(self, url):
		r = requests.get(url)
		return r.text
		
	