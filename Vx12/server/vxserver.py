
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

from tornado.tcpserver import TCPServer
from vxcontroller import vx

import logging
import command
import json
import struct
import binascii

# 
# We could run some validation on the JSON befor esending it back 
# down the pipe to the Browser. Right now, we just validate that the 
# JSON is proper and move it along.
#
_available_commands = frozenset(
["TXT", "ARC", "ELIP", "LI2D", "PO2D", "QUAD", "RECT", "TRI", 
"BG", "CM_D","CM_F", "ST_D","ST_F", "STW", "NOST", "NOFI", 
"FI_D", "FI_F","PUSH_STYLE","POP_STYLE", "SIZE", "ELIP_MODE", 
"RECT_MODE", "ST_CAP", "ST_JOIN", "BEGIN_SHAPE", "END_SHAPE", "VERTEX",
"CR_FONT", "TXT_FONT", "LOAD_FONT", "PUSH_MAT", "POP_MAT", "TRANSL_2i", 
"TRANSL_2f","ROTATE","REG_CB","VAR", "FIT_SCREEN", "STROKE_PALLET",
"ATTACH_LAYER", "SWITCH_SCREEN", "FILL_PALLET", "CREATE_TOOLBAR",
"ADD_BUTTON", "CREATE_PALLET", "VIDEOTAG","DRAW_MENU"]
);

class VxTCPConnection(object):

	def __init__(self, stream, address):
		# self.setLineMode()
		self.id = None
		stream.set_close_callback(self.connectionLost)
		client = address
		self.stream = stream
		logging.info('application at ' + address[0] + ' connected')
		self.id = vx.registerApplication(client, self)
		self.sendEvent("EVENT PRELOAD\n")
		
		self.read_line()

	
	def connectionLost(self):
		logging.info('application ' + self.id + ' disconnected')
		vx.unregisterApplication(self.id)
	
	def read_line(self):
		self.stream.read_until('\n', self.lineReceived)

	def lineReceived(self, data):
		try:
			cmd = json.loads(data)
			if cmd[u'name'] == 'PRELOAD':
				vx.addFontPreload(self.id, cmd['args'][0], cmd['args'][1])
			else:
				vx.pushWebSocketEvent(self.id, cmd)
		except ValueError:
			logging.info("Invalid JSON data received: " + data)
			cmd = command.process(data)
			self.processCommand(cmd)
		self.read_line()

		
	def processCommand(self, cmd):
		# logging.info("In VxProtocol.processCommand:: "+ cmd) 
			
		if cmd['name'] in _available_commands:
			vx.pushWebSocketEvent(self.id, cmd)
			return
			
		if cmd['name'] == "CLEAR":
			vx.pushWebSocketEvent(self.id, cmd)
			# print "Removed call to EXPOSE\n" #self.sendEvent("EVENT EXPOSE\n")
			return
	
	def sendEvent(self, event):
		# logging.info("VxProtocol.sendEvent:: " + event)
		if event.startswith("EVENT"):
			# logging.info("VxProtocol.sendEvent:: " + event)
			# Prevent overflow attempts by limiting communication to the C side to 256-length buffers
			event = event[0:255]
		self.stream.write(str(event))


class VxTCPServer(TCPServer):

	def handle_stream(self, stream, address):
		VxTCPConnection(stream, address)
		