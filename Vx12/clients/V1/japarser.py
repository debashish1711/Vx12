
#
# Jade parser module...
#
#
import re
from jsdefheader import JSdefHeader



def japarser(ifp, cfp, jsfp):

	incomment = False
	# start with C as the default file.. all output goes there
	ofp = cfp
	scope = 0

	# iterate over the file.
	for l in ifp:
		if re.match(r'/\*(\s*)', l):
			incomment = True
		if re.match(r'(\s*)(\*)+/', l):
			incomment = False

		if re.match(r'(\s*)jsdef(\s+)', l) and not incomment:

			# jsdef cannot be detected inside a nested scope .. report error and terminate
			if scope != 0:
				print "jsdef cannot occur inside a nested scope"
				exit(0)

			# now parse the jsdef command .. this would read until the start of the scope -- "{"
			header = JSdefHeader(l)
			scope += 1
			header.parseheader()
			jsfp.write(header.makejsfunction())
			ofp = jsfp
			print header.params
			cfp.write(header.makecheader())
			cfp.write(header.makeuserdefcall())
			
			# Now skip to the next iteration.. we have processed this input line..
			continue

		# Catch open brackets
		if re.match(r'(.*){(.*)', l) and not incomment:
			scope += 1

		# Catch close brackets
		if re.match(r'(.*)}(.*)', l) and not incomment:

			if scope <= 0:
				print "Unexpected } found"
				exit(0)

			scope -= 1
			if scope == 0:
				# undo the redirection.
				if ofp == jsfp:
					jsfp.write("}\n")
					ofp = cfp


		# Output the line to the default output..
		ofp.write(l)








