#!/bin/bash
curl -sL "https://www.ofca.gov.hk/filemanager/ofca/common/datagovhk/tel_no_en_tc.csv" |\
	dos2unix |\
	awk -f ./tojson.awk > phonebook.json
