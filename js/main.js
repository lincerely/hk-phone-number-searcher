var phonebook = null;   //which stores the json data

//-- All displayed text in html --
var titleText = "香港電話號碼查詢";
var subTitleText = "查詢任何香港電話號碼的供應商和類型";

var errorText = "請輸入有效的電話號碼";
var noResultText = "找不到相關資料";
var noDataText = "揾唔到資料呀...<br>召喚IT狗啦";

var changeLangText = "English pls";
var detailText = "詳細";

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

    detailText = "Detail";
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
    errorfield = $('error-msg');

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


    $.getJSON("data/phonebook.json", function (data) {
        phonebook = data;
        console.log("Json loaded.");
        console.log(phonebook);

        //support 'GET' uri inputs
        if (input !== null) {
            $("input").val(input);
            check(input);
        }

    }).fail(function () {
        console.log("Fail loading json.");
        inputfield.prop('disabled', true);
        errorfield.html(noDataText);
        errorfield.fadeIn();
    })

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
            isEqual = row.length === input.length;
        }

        if (isEqual) {
            if (row.start <= input.substring(0, String(row.start).length) && row.end >= input.substring(0, row.end.length)) {
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