// const nlp = require('compromise');
import nlp from 'compromise';

function isSentenceComplete(sentence) {
    // 使用 NLP 库分析句子
    const doc = nlp(sentence);

    // 检查句子是否有动词和名词，这是一个简单的指标，表示句子可能是完整的
    const hasVerb = doc.verbs().length > 0;
    const hasNoun = doc.nouns().length > 0;

    // 检查句子是否以句号、问号或感叹号结束
    const hasEndingPunctuation = /[.!?]$/.test(sentence.trim());

    // 如果句子有动词和名词，并且以句号、问号或感叹号结束，那么我们假设它是完整的
    return hasVerb && hasNoun && hasEndingPunctuation;
}

// console.log(isSentenceComplete("The cat sat on the mat."));
// console.log(isSentenceComplete("The cat sat on.")); 
// console.log(isSentenceComplete("Raft is a consensus algorithm for managing a replicated"));
// console.log(isSentenceComplete("Raft is a consensus algorithm for managing a replicated."))
console.log(isSentenceComplete(''))