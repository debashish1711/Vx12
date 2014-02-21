
# The MIT License (MIT)
# Copyright (c) 2011 Derek Ingrouville, Julien Lord, Muthucumaru Maheswaran

# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:

# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
# IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
# CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
# TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import logging 

import tornado.httpserver
from tornado.httputil import HTTPHeaders

from vxcontroller import vx
import re

_mime_types = {
	'html': 'text/html',
	'css':'text/css',
	'js':'application/x-javascript',
	'jpeg':'image/jpeg',
	'jpg':'image/jpeg',
	'gif':'image/gif',
	'png':'image/png',
	'ttf':'font/truetype',
	'otf':'font/opentype',
	'pde':'application/processing'}

class VxHTTPServer(tornado.httpserver.HTTPServer):
	isLeaf = True
	
	def __init__(self):
		self.static_root = None;
		tornado.httpserver.HTTPServer.__init__(self, self.handle_request)
		
	def setStaticRoot(self, dir):
		self.static_root = dir
		
	# Render / - Index
	def render_Root(self, request):
		response = "<html><body>"
		response += "<p>Using the default template.</p>"
		response += "<ul>"
		
		apps = vx.getConnectedApplications()

		if len(apps) == 0:
			response += "No applications are connected"
		else:
			# Write each application
			for app in apps:
				response += "<li>"
				response += '<a href="%(id)s">Application-%(id)s</a>' % {'id':app}
				response += "</li>"

		
		response += "</ul>"
		response += "<p>Using the test template.</p>"
		response += "<ul>"
		
		apps = vx.getConnectedApplications()

		if len(apps) == 0:
			response += "No applications are connected"
		else:
			# Write each application
			for app in apps:
				response += "<li>"
				response += '<a href="/test/%(id)s">Application-%(id)s</a>' % {'id':app}
				response += "</li>"

		
		response += "</ul>"
		response += "<p><a href='/html_test.html'>HTML5 Test Page</a></p>"
		response += "</body></html>"
		
		self.send_page(request, response)
	
	# Render a connected application
	def render_AvailableApplication(self, request, appid, template='index.template'):
		
		# Get WebSocket Handler for this application
		handler = vx.getWebSocketHandlerPath(appid)

		# Get html that will be served
		templateFile = open(template)
		template = templateFile.read()
		templateFile.close()
		
		# Inject correct handler into html
		html = template % {'id':handler, 'appid':appid}
		
		# Write html
		self.send_page(request, html)
	
	def render_customCSS(self, request):
		'''
		Generates a custom CSS file to create proper @font-face directives
		'''
		appid = request.path.split('/')[1]

		pre = "";
		fonts = vx.getFontPreload(appid)
		for pair in fonts:
			pre = pre + '@font-face{\n\tfont-family:"'+str(pair[0])+'";\n\tsrc: url(' + str(pair[1]) + ');\n}\n'

		self.send_page(request, pre, 'css')


	def render_Preload(self, request, template='test.pde'):
		appid = request.path.split('/')[1]
		
		# pde only needs values for now
		# if Processing-js team gets their act together this might change
		fonts = vx.getFontPreload(appid)
		if len(fonts) == 0:
			return "/* nothing to see here */"
		font_str = ','.join([x[1] for x in fonts])
		
		# Get html that will be served
		templateFile = open(template)
		template = templateFile.read()
		templateFile.close()
		
		# Inject correct handler into html
		html = template % {'fonts':font_str}
		
		self.send_page(request, html, 'pde')
				
	# Render an application that is in use
	def render_UnavailableApplication(self, request, clientID):
		msg = "<html><body>Application is already in use</body></html>"
		self.send_page(request, msg)
	
	# Render application that has not connected
	def render_UnknownApplication(self, request, clientID):
		msg = "<html><body>Unknown Application</body></html>"
		self.send_page(request, msg)

	# Appropriately render an application
	def render_Application(self, request, template='index.template'):
# 		appid = request.path.split('/')[-1]
 		apps = vx.getConnectedApplications()
# 		appid = '1'
		appi = 0
   		for app in apps:
   		 appi+=1
   		 appid = str(appi)
 		 if appid in vx.getConnectedApplications():
			
		 	if vx.applicationIsAvailable(appid):
		 		return self.render_AvailableApplication(request, appid, template)
		 	else:
		 		return self.render_UnavailableApplication(request, appid)
			
  		 return self.render_UnknownApplication(request, appid)

	# Render the html template test page
	def render_templateTestPage(self, request):
		
		# Get html that will be served
		templateFile = open('test.template')
		template = templateFile.read()
		templateFile.close()
		
		# return template
		self.send_page(request, template)

	#Render all static content
	def render_Static(self, request, filepath):
		f = None
		try:
			f = open(filepath)
			content = f.read()
			f.close()
			ext = filepath.split('.')[-1] # get everything after the last period
			self.send_page(request, content, ext)
		except IOError:
			content = "<html><body>File not found</body></html>"
			self.send_page(request, content, 'html', 404)



	def send_page(self, request, content, mime='html', status=200):
		if status == 200:
			request.write("HTTP/1.1 200 OK\r\nContent-Type: %s\r\nContent-Length: %d\r\n\r\n%s" 
				% (_mime_types[mime], len(content), content))
		elif status == 404:
			request.write("HTTP/1.1 404 Not Found\r\Content-Type: %s\r\nContent-Length: %d\r\n\r\n%s"
				% ( _mime_types[mime], len(content), content))

		request.finish()

	# Hander GET request
	def handle_request(self, request):
		# TODO: Get static file serving working correctly
		
		if request.path == '/html_test.html':
 			self.render_templateTestPage(request)
# 		if request.path == '/html_test.html':
# 			self.render_templateTestPage(request)
# 		elif re.match("/\d+/test\.pde", request.path):
# 			self.render_Preload(request);
# 		elif re.match("/\d+/custom\.css", request.path):
# 			self.render_customCSS(request);
# 		elif re.match("/test/\d+", request.path):
# 			self.render_Application(request, "test.template")
# 		elif re.match("/\d+$", request.path):
# 			self.render_Application(request)
 		elif re.match(".+\.(css|js|gif|png|jpeg|jpg|ttf|otf|eot|svg)$", request.path):
 			f = request.path.split('/', 1)[-1]
 			print "looking for " + f
 			self.render_Static(request, f)
 		else:
			self.render_Application(request)
