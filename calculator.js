/* Exact rational arithmetic powered by arbitrary-size BigInt integers.
 * No eval(), floating point math, rounding, or network dependencies. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ExactCalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const abs = n => n < 0n ? -n : n;
  function gcd(a, b) { a=abs(a); b=abs(b); while(b) [a,b]=[b,a%b]; return a; }
  function rational(n,d=1n) {
    if(d===0n) throw Error("Division by zero");
    if(d<0n){n=-n;d=-d;}
    const g=gcd(n,d); return {n:n/g,d:d/g};
  }
  const add=(a,b)=>rational(a.n*b.d+b.n*a.d,a.d*b.d);
  const sub=(a,b)=>rational(a.n*b.d-b.n*a.d,a.d*b.d);
  const mul=(a,b)=>rational(a.n*b.n,a.d*b.d);
  const div=(a,b)=>rational(a.n*b.d,a.d*b.n);
  function pow(a,b){
    if(b.d!==1n) throw Error("Exponent must be an integer for exact results");
    if(abs(b.n)>10000n) throw Error("Exponent too large");
    if(b.n<0n) return rational(a.d**(-b.n),a.n**(-b.n));
    return rational(a.n**b.n,a.d**b.n);
  }
  const ten = n => 10n**BigInt(n);
  function decimal(s){
    const [whole,frac=""]=s.split(".");
    return rational(BigInt((whole||"0")+frac),ten(frac.length));
  }
  function tokenize(input){
    const s=input.replace(/×|✕|\*/g,"*").replace(/÷/g,"/").replace(/[−–]/g,"-").replace(/\bans\b/gi,"@");
    const tokens=[];let i=0;
    while(i<s.length){
      const tail=s.slice(i), match=tail.match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
      if(match){tokens.push({type:"number",value:match[0]});i+=match[0].length;continue;}
      if(/\s/.test(s[i])){i++;continue;}
      const c=s[i];
      if("+-*/^()%@".includes(c)){tokens.push({type:c});i++;continue;}
      if(/[xX]/.test(c)){tokens.push({type:"*"});i++;continue;}
      if(c==="π") throw Error("π is irrational and cannot be represented exactly as a fraction");
      throw Error("Unexpected character: "+c);
    }
    return tokens;
  }
  function evaluate(input,ans=rational(0n)){
    const t=tokenize(input);let p=0;
    if(!t.length) throw Error("Enter an expression");
    const peek=()=>t[p]?.type;
    const take=x=>{if(peek()===x){p++;return true;}return false;};
    function primary(){
      if(take("(")){const v=expression();if(!take(")"))throw Error("Missing closing parenthesis");return v;}
      if(take("@"))return ans;
      if(peek()==="number")return decimal(t[p++].value);
      throw Error("Expected a number or opening parenthesis");
    }
    function power(){
      let v=primary();if(take("^"))v=pow(v,unary());return v;
    }
    function unary(){
      if(take("+"))return unary();
      if(take("-")){const v=unary();return rational(-v.n,v.d);}
      return power();
    }
    function multiplicative(){
      let v=unary();while(peek()==="*"||peek()==="/"||peek()==="%"){
        const op=t[p++].type,b=unary();
        if(op==="*")v=mul(v,b);
        else if(op==="/")v=div(v,b);
        else {if(v.d!==1n||b.d!==1n)throw Error("Remainder requires integers");if(b.n===0n)throw Error("Division by zero");v=rational(v.n%b.n);}
      }return v;
    }
    function expression(){let v=multiplicative();while(peek()==="+"||peek()==="-"){const op=t[p++].type,b=multiplicative();v=op==="+"?add(v,b):sub(v,b);}return v;}
    const result=expression();if(p<t.length)throw Error("Unexpected input near "+t[p].type);
    return result;
  }
  function fraction(v){return v.d===1n?v.n.toString():v.n+"/"+v.d;}
  function decimalParts(v,limit=2000){
    if(!Number.isSafeInteger(limit)||limit<1)throw Error("Invalid display limit");
    const negative=v.n<0n?"-":"",a=abs(v.n);
    const whole=(a/v.d).toString();let remainder=a%v.d,nonRepeating="",repeating="";
    if(!remainder)return {negative,whole,nonRepeating,repeating,exact:true};
    // Detect preperiod by removing factors of 2 and 5 from the denominator.
    let d=v.d,twos=0,fives=0;
    while(d%2n===0n){d/=2n;twos++;}
    while(d%5n===0n){d/=5n;fives++;}
    const prefixLength=Math.max(twos,fives);
    if(prefixLength>limit)return {negative,whole,nonRepeating:"",repeating:"",exact:false};
    for(let i=0;i<prefixLength&&remainder;i++){
      remainder*=10n;nonRepeating+=(remainder/v.d).toString();remainder%=v.d;
    }
    if(!remainder)return {negative,whole,nonRepeating,repeating,exact:true};
    const start=remainder;
    do{
      if(nonRepeating.length+repeating.length>=limit)return {negative,whole,nonRepeating,repeating,exact:false};
      remainder*=10n;repeating+=(remainder/v.d).toString();remainder%=v.d;
    }while(remainder!==start);
    return {negative,whole,nonRepeating,repeating,exact:true};
  }
  return {evaluate,fraction,decimalParts,rational};
});
