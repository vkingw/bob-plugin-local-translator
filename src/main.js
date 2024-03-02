//@ts-check

var lang = require("./lang.js");
var SYSTEM_PROMPT = require("./const.js").SYSTEM_PROMPT;

var {
    buildHeader,
    handleGeneralError,
    replacePromptKeywords
} = require("./utils.js");


/**
 * @param {Bob.TranslateQuery} query
 * @returns {{
 *  generatedSystemPrompt: string,
 *  generatedUserPrompt: string
 * }}
*/
function generatePrompts(query) {
    let generatedSystemPrompt = SYSTEM_PROMPT;
    const { detectFrom, detectTo } = query;
    const sourceLang = lang.langMap.get(detectFrom) || detectFrom;
    const targetLang = lang.langMap.get(detectTo) || detectTo;
    let generatedUserPrompt = `translate from ${sourceLang} to ${targetLang}`;

    if (detectTo === "wyw" || detectTo === "yue") {
        generatedUserPrompt = `翻译成${targetLang}`;
    }

    if (
        detectFrom === "wyw" ||
        detectFrom === "zh-Hans" ||
        detectFrom === "zh-Hant"
    ) {
        if (detectTo === "zh-Hant") {
            generatedUserPrompt = "翻译成繁体白话文";
        } else if (detectTo === "zh-Hans") {
            generatedUserPrompt = "翻译成简体白话文";
        } else if (detectTo === "yue") {
            generatedUserPrompt = "翻译成粤语白话文";
        }
    }
    if (detectFrom === detectTo) {
        generatedSystemPrompt =
            "You are a text embellisher, you can only embellish the text, don't interpret it.";
        if (detectTo === "zh-Hant" || detectTo === "zh-Hans") {
            generatedUserPrompt = "润色此句";
        } else {
            generatedUserPrompt = "polish this sentence";
        }
    }

    generatedUserPrompt = `${generatedUserPrompt}:\n\n${query.text}`

    return { generatedSystemPrompt, generatedUserPrompt };
}

/**
 * @param {string} model
 * @param {Bob.TranslateQuery} query
 * @returns {{
 *  model: string;
 *  temperature: number;
 *  max_tokens: number;
 *  top_p: number;
 *  frequency_penalty: number;
 *  presence_penalty: number;
 *  messages?: {
 *    role: "system" | "user";
 *    content: string;
 *  }[];
 *  prompt?: string;
 * }}
*/
function buildRequestBody(model, query) {
    let { customSystemPrompt, customUserPrompt } = $option;
    const { generatedSystemPrompt, generatedUserPrompt } = generatePrompts(query);

    customSystemPrompt = replacePromptKeywords(customSystemPrompt, query);
    customUserPrompt = replacePromptKeywords(customUserPrompt, query);

    const systemPrompt = customSystemPrompt || generatedSystemPrompt;
    const userPrompt = customUserPrompt || generatedUserPrompt;

    const standardBody = {
        model: model,
        temperature: 0.2,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
    };

    return {
        ...standardBody,
        model: model,
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: userPrompt,
            },
        ],
    };
}

/**
 * @param {Bob.TranslateQuery} query
 * @param {string} targetText
 * @param {string} textFromResponse
 * @returns {string}
*/
function handleStreamResponse(query, targetText, textFromResponse) {
    if (textFromResponse !== '[DONE]') {
        try {
            const dataObj = JSON.parse(textFromResponse);
            // https://github.com/openai/openai-node/blob/master/src/resources/chat/completions.ts#L190
            const { choices } = dataObj;
            const delta = choices[0]?.delta?.content;
            if (delta) {
                targetText += delta;
                query.onStream({
                    result: {
                        from: query.detectFrom,
                        to: query.detectTo,
                        toParagraphs: [targetText],
                    },
                });
            }
        } catch (err) {
            handleGeneralError(query, {
                type: err.type || "param",
                message: err.message || "Failed to parse JSON",
                addition: err.addition,
            });
        }
    }
    return targetText;
}

/**
 * @param {Bob.TranslateQuery} query
 * @param {Bob.HttpResponse} result
 * @returns {void}
*/
function handleGeneralResponse( query, result) {
    const { content} = result.messages;

    if (!content || content.length === 0) {
        handleGeneralError(query, {
            type: "api",
            message: "接口未返回结果"+JSON.stringify(result) ,
            addition: JSON.stringify(result),
        });
        return;
    }

    let targetText = content.trim();

    // 使用正则表达式删除字符串开头和结尾的特殊字符
    targetText = targetText.replace(/^(『|「|"|“)|(』|」|"|”)$/g, "");

    // 判断并删除字符串末尾的 `" =>`
    if (targetText.endsWith('" =>')) {
        targetText = targetText.slice(0, -4);
    }

    query.onCompletion({
        result: {
            from: query.detectFrom,
            to: query.detectTo,
            toParagraphs: targetText.split("\n"),
        },
    });
}

/**
 * @type {Bob.Translate}
 */
function translate(query) {
    if (!lang.langMap.get(query.detectTo)) {
        handleGeneralError(query, {
            type: "unsupportLanguage",
            message: "不支持该语种",
            addition: "不支持该语种",
        });
    }

    const {
        apiUrl,
        customModel,
        model,
        stream,
    } = $option;

    const isCustomModelRequired = model === "custom";
    if (isCustomModelRequired && !customModel) {
        handleGeneralError(query, {
            type: "param",
            message: "配置错误 - 请确保您在插件配置中填入了正确的自定义模型名称",
            addition: "请在插件配置中填写自定义模型名称",
        });
    }

    const modelValue = isCustomModelRequired ? customModel : model;

    const baseUrl = apiUrl;

    const header = buildHeader();
    const body = buildRequestBody(modelValue, query);

    (async () => {
        if (stream) {
            let resultText = "";
            $log.info(JSON.stringify(body));
            await $http.streamRequest({
                method: "POST",
                url: "http://localhost:11434/api/chat",
                header,
                body: {
                    ...body,
                    stream: true,
                },
                cancelSignal: query.cancelSignal,
                streamHandler: (stream) => {
                    let streamText = stream.text;
                    if (!streamText) {
                        throw new Error("response data invalid");
                    }
                    const resultJson = JSON.parse(streamText);

                    if (!resultJson.message){
                        throw new Error("response data invalid");
                    }
                    resultText += resultJson?.message?.content || "";
                    query.onStream({
                        result: { toParagraphs: [resultText] },
                    });
                },
                handler: (result) => {
                    if (result.response.statusCode >= 400) {
                        handleGeneralError(query, result);
                    } else {
                        query.onCompletion({
                            result: {
                                from: query.detectFrom,
                                to: query.detectTo,
                                toParagraphs: [resultText],
                            },
                        });
                    }
                }
            });
        } else {
            const result = await $http.request({
                method: "POST",
                url: baseUrl ,
                header,
                body: {
                    ...body,
                    stream: false,
                },
            });

            if (result.error) {
                handleGeneralError(query, result);
            } else {
                handleGeneralResponse(query, result);
            }
        }
    })().catch((err) => {
        handleGeneralError(query, err);
    });
}

function supportLanguages() {
    return lang.supportLanguages.map(([standardLang]) => standardLang);
}

function pluginTimeoutInterval() {
    return 60;
}

exports.pluginTimeoutInterval = pluginTimeoutInterval;
exports.supportLanguages = supportLanguages;
exports.translate = translate;