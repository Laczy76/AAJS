# Set the source directory
srcdir = src/
builddir = build/

# Create the list of modules
modules = ${srcdir}Stage.js\
		  ${srcdir}VisuData.js\
		  ${srcdir}VisuVariable.js\
		  ${srcdir}VisuArray.js

# Combined file (temporary file)
combined1 = ${builddir}_combined1.js
combined2 = ${builddir}_combined2.js

# Compressed file (output)
output = ${builddir}inalan.js
		  
all: combine compress copyright clean1 clean2
		  
# Combine files
combine:	
	cat ${modules} > ${combined1}
			
# Compress all of the modules into inalan.js
compress:
    java -jar yuicompressor-2.4.7.jar ${combined1} -o ${combined2}

# Add copyright notice	
copyright:
	cat copyright_notice.txt ${combined2} > ${output}
	
# Delete combined files
clean1:
	rm ${combined1}
clean2:
	rm ${combined2}
	
