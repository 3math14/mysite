function toHex(v) {
  return ("00" + v.toString(16)).slice(-2).toUpperCase();
}

const changeCss = (index,cssRuleText,styleName,styleValue) => {

    // styleSheetを指定
    var styleSheet_index = index
    var styleSheet = document.styleSheets[styleSheet_index];

    // Textからindexを指定するための連想配列を作成
    let ruleList = styleSheet.cssRules;
    var cssRuleTexts = {};
    for (let i=0; i < ruleList.length; i++) {
      cssRuleTexts[ruleList[i].selectorText] = i;
    }

    // スタイルを変更
    var cssRule = styleSheet.cssRules[cssRuleTexts[cssRuleText]];
    cssRule=cssRule.style.setProperty(styleName,styleValue);
  }

function update_field(){

  // inputformの値を取得
  var red = $('#input-red').val();
  var green = $('#input-green').val();
  var blue = $('#input-blue').val();

  changeCss(0,'.circle-red','background',`rgba(${red},0,0,1)`);
  changeCss(0,'#colorCodeRed','color',`rgba(${red},0,0,1)`);
  changeCss(0,'.circle-green','background',`rgba(0,${green},0,1)`);
  changeCss(0,'#colorCodeGreen','color',`rgba(0,${green},0,1)`);
  changeCss(0,'.circle-blue','background',`rgba(0,0,${blue},1)`);
  changeCss(0,'#colorCodeBlue','color',`rgba(0,0,${blue},1)`);
  changeCss(0,'#colorCode','color',`rgba(${red},${green},${blue},1)`);
  document.getElementById('colorCodeRed').textContent = toHex(red);
  document.getElementById('colorCodeGreen').textContent = toHex(green);
  document.getElementById('colorCodeBlue').textContent = toHex(blue);
}

$(function() {
  $('input[type="number"]').on('keyup change', function() {
    update_field();
  });
});