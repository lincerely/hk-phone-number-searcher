function normalize(d) {
	if (d == "N/A" || d == "") {
		return null;
	} else {
		return d;
	}
}

function parse_phonebook(t) {
    var phonebook = [];

	var lines = t.split("\r\n");
	for (i = 1; i < lines.length; i++) {
		var entries = lines[i].split("\",\"");
		entries[0] = entries[0].replace(/^\"/, "");
		entries[7] = entries[7].replace(/\"$/, "");
		entries[0] = entries[0].replace("-", "");
		entries[1] = entries[1].replace("-", "");
		phonebook[i-1] = {
			start: normalize(entries[0]),
			end: normalize(entries[1]),
			length: normalize(entries[2]),
			"special#": normalize(entries[3]),
			type: normalize(entries[4]),
			subtype: normalize(entries[5]),
			company: normalize(entries[6]),
			remark: normalize(entries[7])
		}
	}
	return phonebook;
}

var phonebook = null;

//-- All displayed text in html --
var titleText = "香港電話號碼查詢";
var subTitleText = "查詢任何香港電話號碼的供應商和類型";

var errorText = "請輸入有效的電話號碼";
var noResultText = "找不到相關資料";
var noDataText = "揾唔到資料呀...召喚IT狗啦 :/";

var changeLangText = "English pls";
var detailText = "資料來源及最後更新日期";

var typeText = "主類別";
var subTypeText = "次類別";
var companyText = "公司／團體";
var remarkText = "備註";
var specialText = "特別號碼";

var srcText = "詳細說明...";

//Look for GET parameter: input and lang
var searchParams = new URLSearchParams(window.location.search);

var input = searchParams.get("input") || null;
var lang = searchParams.get("lang") || "zh";
console.log("lang = " + lang);

if (lang === "en") {

    //-- Eng Alternative --
    titleText = "HK Phone Searcher";
    subTitleText = "Retreive carrier information and type of<br> Any Hong Kong Phone Number";

    errorText = "Please enter a valid phone number.";
    noResultText = "No result found.";
    noDataText = "Sorry, I can't get any data from the server.<br>Please contact the IT guy to fix this :/";

    detailText = "Source and Last update date";
    changeLangText = "中文呀";

    typeText = "Category";
    subTypeText = "Sub-category";
    companyText = "Allocated / Assigned to (Company / Entity)";
    remarkText = "Remarks";
    specialText = "Special Number?";

    srcText = "More Detail...";
}

var inputfield = null;
var form = null;
var resultfield = null;
var errorfield = null;

$(document).ready(function () {

    inputfield = $("input[name='input']");
    form = $('form');
    resultfield = $('#result');
    errorfield = $('#error-msg');

    $('h1').text(titleText);
    $('#subTitle').html(subTitleText + "<br>");
    $('#detail').text(detailText);
    $('#changeLang').text(changeLangText);

    errorfield.hide();
    resultfield.hide();

    if (lang === "en")
        $('#changeLang').attr("href", "?lang=zh");

    setTimeout(function () {
        $("#input-box").fadeIn()
    }, 500);
    
	var date = new Date();
	date.setDate(date.getDate() - 1);
	let date_str = date.toISOString().slice(0,10).replaceAll("-","");

	let encoded_url = "https%3A%2F%2Fwww.ofca.gov.hk%2Ffilemanager%2Fofca%2Fcommon%2Fdatagovhk%2Ftel_no_en_tc.csv";
	let file_version_url = "https://api.data.gov.hk/v1/historical-archive/list-file-versions?url="+encoded_url+"&start="+date_str+"&end="+date_str;
	fetch(file_version_url).then(function(resp) {
		return resp.json();
	}).then(function(d) {
	    const archive_url = "https://api.data.gov.hk/v1/historical-archive/get-file?url="+encoded_url+"&time="+d.timestamps[0];
	    return fetch(archive_url)
	}).then(function(resp) {
		return resp.text();
	}).then(function(t) {
	    phonebook = parse_phonebook(t);
	    console.log("phonebook loaded.");
        console.log(phonebook);

        //support 'GET' uri inputs
        if (input !== null) {
            $("input").val(input);
            check(input);
    	}
    }).catch(function(err) {
		console.log("failed to fetch data: " + err);
		
		errorfield.html(noDataText);
        errorfield.fadeIn();
        inputfield.prop('disabled', true);

        form.find(".ripple-this").removeClass('ripple-this');
        form.find("button").prop('disabled', true);
	});

    form.on('submit', function (e) {
        resultfield.hide();
        input = inputfield.val();
        //resultfield.focus();
        check(input);
        e.preventDefault();
    });

    $.ripple(".ripple-this",{
        debug: false,
        multi: true,
        opacity: 0.2
    })


});

function check(input) {
    input = input.replace('-', '');
    if (isNaN(input) || input === '') {
        //invalidate input
        errorfield.html(errorText).fadeIn();
    } else {
        errorfield.hide();
        getResult(input);
    }
}


function getResult(input) {
    var result = noResultText;
    //go through each row in phone book
    $.each(phonebook, function (index, row) {

        var isEqual = false;
        if (row.length === null || row.length === "Variable") {
            isEqual = true;
        } else if (isNaN(row.length)) {

            if (row.length.includes('-')) {
                //length value is a range
                var range = row.length.split('-');
                isEqual = (input.length >= parseInt(range[0]) && input.length <= parseInt(range[1]));
            } else {
                //length value includes a expression
                isEqual = eval(String(input.length) + row.length);
            }

        } else {
            isEqual = row.length == input.length;
        }

        if (isEqual) {
            if (row.start <= input.substring(0, String(row.start).length) && row.end >= input.substring(0, String(row.end).length)) {
                result = ""
                result += "<p>" + typeText + "<br><b>" + row.type + "</b></p>";
                if (row.subtype !== null)
                    if (row.subtype.includes('**'))
                        result += "<p>" + subTypeText + "<br><b><i>" + row.subtype + "</i></b></p>";
                    else
                        result += "<p>" + subTypeText + "<br><b>" + row.subtype + "</b></p>";

                if (row.company !== null)
                    if (row.company.includes('**'))
                        result += "<p>" + companyText + "<br><b><i>" + row.company + "</i></b></p>";
                    else
                        result += "<p>" + companyText + "<br><b>" + row.company + "</b></p>";

                if (row['special#'] !== null)
                    result += "<p>" + specialText + "<br><b class='material-icons'>done</b></p>";
                else
                    result += "<p>" + specialText + "<br><b class='material-icons'>clear</b></p>";

                if (row.remark !== null)
                    result += "<p>" + remarkText + "<br><b>" + row.remark + "</b></p>";

                result += "<a style='padding-left: 0px' href='http://www.ofca.gov.hk/filemanager/ofca/tc/content_311/no_plan.pdf' alt='Numbering Plan PDF'><small>" + srcText + "</small></a>";

                console.log(row);
                return false;

            }
        }
    });
    resultfield.html(result).slideDown();

    //scroll to result automatically
    // ref from: https://stackoverflow.com/questions/6677035/jquery-scroll-to-element
    $('html, body').animate({
        scrollTop: resultfield.offset().top
    }, 2000);

}
