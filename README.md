# HK Phone Searcher

Retreive HK phone number information from OFCA's number plan and provide a user-friendly interface to search through it.

![Screen shot](./img/phoneSearch.png)

The following information will be displayed on available:
 - Number Category 號碼主類別
 - NumberSub-category 號碼次類別
 - Allocated/Assigned to (Company / Entity) 用戶 (公司 / 團體)
 - Special Number 特別號碼 (✓ / ✗)
 - Remarks 備註
 
Support English and Traditional Chinese.

## Prepare Data

Get numbering plan from https://www.ofca.gov.hk/filemanager/ofca/common/datagovhk/tel_no_en_tc.csv and parse it into a clean json file.

``` bash
    cd data
    ./getData.sh
```    

and update the "Last Update" time in `index.html`
