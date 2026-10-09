(function(){
  const $=id=>document.getElementById(id), input=$("expression"),result=$("result"),info=$("result-info"),history=$("history");
  let last=ExactCalculator.rational(0n),current=last,items=[];
  const fractionMode=$("fractions");
  function show(v){
    current=v;result.replaceChildren();result.classList.remove("error");
    if(fractionMode.checked){result.textContent=ExactCalculator.fraction(v);info.textContent="Exact reduced fraction · No rounding";return;}
    const x=ExactCalculator.decimalParts(v);
    if(!x.exact){
      result.textContent=ExactCalculator.fraction(v);
      info.textContent="Repeating expansion exceeds 2,000 digits; exact fraction shown instead.";
      return;
    }
    result.append(document.createTextNode(x.negative+x.whole+(x.nonRepeating||x.repeating?".":"") + x.nonRepeating));
    if(x.repeating){const over=document.createElement("span");over.className="overline";over.textContent=x.repeating;result.append(over);info.textContent="Repeating digits marked with a vinculum · Exact";}
    else info.textContent="Terminating decimal · Exact";
  }
  function evaluate(){
    try{
      const text=input.value.trim(),v=ExactCalculator.evaluate(text,last);
      last=v;show(v);items.unshift({expression:text,answer:ExactCalculator.fraction(v)});items=items.slice(0,20);renderHistory();
    }catch(e){result.replaceChildren();result.textContent=e.message;result.classList.add("error");info.textContent="Check your expression and try again.";}
  }
  function renderHistory(){
    history.replaceChildren();
    $("history-count").textContent=items.length+" calculation"+(items.length===1?"":"s");
    if(!items.length){const p=document.createElement("p");p.className="empty";p.textContent="Your calculations will appear here.";history.append(p);return;}
    for(const item of items){
      const button=document.createElement("button");button.className="history-item";button.type="button";button.title="Use this expression";
      const left=document.createElement("span");left.className="history-expression";left.textContent=item.expression;
      const right=document.createElement("span");right.className="history-answer";right.textContent=item.answer;
      button.append(left,right);button.addEventListener("click",()=>{input.value=item.expression;input.focus();});
      history.append(button);
    }
  }
  $("calculate").addEventListener("click",evaluate);
  input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();evaluate();}});
  fractionMode.addEventListener("change",()=>show(current));
  $("copy-result").addEventListener("click",async()=>{const text=ExactCalculator.fraction(current);try{await navigator.clipboard.writeText(text);info.textContent="Exact fraction copied: "+text;}catch{info.textContent="Copy unavailable; fraction: "+text;}});
  $("clear-history").addEventListener("click",()=>{items=[];renderHistory();});
  document.querySelectorAll("[data-key],[data-action]").forEach(button=>button.addEventListener("click",()=>{
    const action=button.dataset.action;
    if(action==="evaluate"){evaluate();return;}
    if(action==="clear"){input.value="";show(ExactCalculator.rational(0n));input.focus();return;}
    if(action==="backspace"){const a=input.selectionStart,b=input.selectionEnd;if(a!==b){input.setRangeText("",a,b,"start");}else if(a>0){input.setRangeText("",a-1,a,"start");}input.focus();return;}
    const key=button.dataset.key;
    if(key==="π"){info.textContent="π is irrational; exact rational calculations do not support it.";return;}
    input.setRangeText(key,input.selectionStart,input.selectionEnd,"end");input.focus();
  }));
  show(current);
})();
