BEGIN { 
	FS="\",\"" 
	print "["

}

NR > 2 {
	print ","
}

NR > 1 {
	sub("^\"", "", $1)
	sub("\"$", "", $8)
	sub("-", "", $1)
	sub("-", "", $2)
	print("\t{")
	printf("\t\t\"start\":%s,\n", jsonPrint($1))
	printf("\t\t\"end\":%s,\n", jsonPrint($2))
	printf("\t\t\"length\":%s,\n", jsonPrint($3))
	printf("\t\t\"special#\":%s,\n", jsonPrint($4))
	printf("\t\t\"type\":%s,\n", jsonPrint($5))
	printf("\t\t\"subtype\":%s,\n", jsonPrint($6))
	printf("\t\t\"company\":%s,\n", jsonPrint($7))
	printf("\t\t\"remark\":%s\n", jsonPrint($8))
	printf("\t}")
}

END {
	print "]"
}

func jsonPrint(d) {
	if (d == "N/A" || d == "" ) {
		return "null"
	}
	if (d ~ /^[1-9][0-9]*$/) {
		return d
	} else {
		gsub("\"","\\\"",d)
		return "\""d"\""
	}
}
