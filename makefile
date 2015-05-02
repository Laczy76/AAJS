# Set the source directory
srcdir = src/
builddir = build/

# Create the list of modules
modules = ${srcdir}Stage.js\
		  ${srcdir}VisuData.js\
		  ${srcdir}VisuVariable.js\
		  ${srcdir}VisuArray.js

# Combined file (temporary file)
combined = ${builddir}_combined.js

# Compressed file (output)
compressed = ${builddir}inalan.js
		  
all: combine compress clean
		  
# Combine files
combine:	
	cat ${modules} > ${combined}
			
# Compress all of the modules into inalan.js
compress:
    java -jar yuicompressor-2.4.7.jar ${combined} -o ${compressed}

# Delete combined file
clean:
	rm ${combined}