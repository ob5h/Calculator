const assert=require("node:assert/strict");
const {evaluate,fraction,decimalParts,decimalString}=require("./calculator.js");
const cases=[
["1/3","1/3"],["1/6","1/6"],["0.1+0.2","3/10"],["2 x (3+4)","14"],["2 * 3","6"],["2 × 3","6"],["6 ÷ 4","3/2"],["2^10","1024"],["-2^2","-4"],["(-2)^2","4"],["2^-3","1/8"],["1/7","1/7"],["5%2","1"],["1.234567890123456789+0.000000000000000001","123456789012345679/100000000000000000"],["1/999999999999999999999","1/999999999999999999999"]
];
for(const [expr,expected] of cases) assert.equal(fraction(evaluate(expr)),expected,expr);
assert.deepEqual(decimalParts(evaluate("1/6")),{negative:"",whole:"0",nonRepeating:"1",repeating:"6",exact:true});
assert.deepEqual(decimalParts(evaluate("-1/7")),{negative:"-",whole:"0",nonRepeating:"",repeating:"142857",exact:true});
assert.equal(decimalParts(evaluate("1/8")).nonRepeating,"125");
assert.equal(decimalParts(evaluate("1/97"),20).exact,false);
assert.equal(fraction(evaluate("ans+2",evaluate("1/3"))),"7/3");
for(const expr of ["1/0","3+","abc","2^0.5","(1+2","π","2 3"]) assert.throws(()=>evaluate(expr),undefined,expr);
assert.equal(decimalString(evaluate("1/3")).text, "0.3\u0305");
assert.equal(decimalString(evaluate("1/6")).text, "0.16\u0305");
assert.equal(decimalString(evaluate("1/7")).text, "0.1\u03054\u03052\u03058\u03055\u03057\u0305");
assert.equal(decimalString(evaluate("-1/6")).text, "-0.16\u0305");
assert.equal(decimalString(evaluate("0.1+0.2")).text, "0.3");
assert.equal(decimalString(evaluate("1/97"),20).text, "1/97");
console.log("Passed "+cases.length+" exact arithmetic cases, Unicode vinculum and parser checks.");
