import tornado.ioloop
import threading
import logging
logging.basicConfig(format='%(levelname)s: %(message)s', level=logging.DEBUG)

# HTTP
from http import VxHTTPServer

# VX Server
from vxserver import VxTCPServer

# WebSocket
from websocketServer import VxWebSocketHandler

from video import videoSocketHandler, videoFeed
# Configuration
import sys
print(sys.version)

# vxServer configuration parameters
tcpPort = 9090

# HTTP server configuration parameters
httpPort = 8080

# WebSocket server configuration parameters
websocketPort = 7070

# HTTP Service
httpRoot = VxHTTPServer()
httpRoot.listen(httpPort)

# VX Service
tcpServer = VxTCPServer()
tcpServer.listen(tcpPort)

# WebSocket Services
websocketService = tornado.web.Application([
        (r"^/[0-9]+_Handler", VxWebSocketHandler),
        (r"/video", videoSocketHandler)
    ])
websocketService.listen(websocketPort)

def start_tornado():
	tornado.ioloop.IOLoop.instance().start()

def stop_tornado():
    ioloop = tornado.ioloop.IOLoop.instance()
    ioloop.add_callback(lambda x: x.stop(), ioloop)

if __name__ == "__main__":
    t = threading.Thread(target=start_tornado)
    t.start()
    videoFeed()
    stop_tornado()
    t.join()