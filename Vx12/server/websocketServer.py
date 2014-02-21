
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


import tornado.websocket
import logging
import vxcontroller
import json

class VxWebSocketHandler(tornado.websocket.WebSocketHandler):

	def __del__(self):
		logging.info('Deleting websocket handler')

	def on_message(self, frame):
		path = self.request.path
		vxcontroller.vx.pushVxEvent(path, frame)
		

	def open(self):
		logging.info('Connected to client.')
		path = self.request.path
		vxcontroller.vx.registerWebSocketHandler(path, self)
		# On connection establishment, send a single SETUP event to the client
		# vxcontroller.vx.pushVxEvent(path, "EVENT SETUP\n")

	def on_close(self):
		logging.info('Lost websocket connection')
		path = self.request.path
		vxcontroller.vx.unregisterWebSocketHandler(path)
	
	def closeConnection(self):
		logging.info('Closing websocket connection')
		self.close()
	
	def sendEvent(self, event):
		# logging.info("webSocketServer::Sending Event " + event + " to Browser")
		self.write_message(json.dumps(event))
