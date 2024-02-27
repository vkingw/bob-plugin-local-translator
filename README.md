<h4 align="right">
  <strong>简体中文</strong> | <a href="https://github.com/vkingw/bob-plugin-local-translator/blob/main/docs/README_EN.md">English</a>
</h4>

<div>
  <h1 align="center">Local Model Translator Bob Plugin</h1>
  <p align="center">
    <a href="https://github.com/vkingw/bob-plugin-local-translatorr/releases" target="_blank">
        <img src="https://github.com/vkingw/bob-plugin-local-translator/actions/workflows/release.yaml/badge.svg" alt="release">
    </a>
    <a href="https://github.com/vkingw/bob-plugin-local-translator/releases">
        <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/yetone/bob-plugin-openai-translator?style=flat">
    </a>
    <a href="https://github.com/vkingw/bob-plugin-local-translator/releases">
        <img alt="GitHub Repo stars" src="https://img.shields.io/badge/openai-Bob-brightgreen?style=flat">
    </a>
    <a href="https://github.com/vkingw/bob-plugin-local-translator/releases">
        <img alt="GitHub Repo stars" src="https://img.shields.io/badge/langurage-JavaScript-brightgreen?style=flat&color=blue">
    </a>
  </p>
</div>

## 简介

使用本地模型进行各种翻译、润色工作，特别是使用一些2B模型，速度就是🚀，隐私问题也有相应的保障。

### 润色功能

此插件已支持使用 ChatGPT API 对句子进行润色和语法修改，只需要把目标语言设置为与源语言一样即可，全面替代 Grammarly！而且理论上任何语言都可以润色，不仅仅是英语。

如果你不喜欢将翻译功能和文本润色功能放在一起，这里单独拆分出了一个专门用来文本润色和语法纠错的插件: [bob-plugin-openai-polisher](https://github.com/yetone/bob-plugin-openai-polisher)，这个润色插件具有更高级的润色功能，比如解释修改原因等。

### 语言模型

本地运行的语言模型

## 使用方法

1. 安装 [Bob](https://bobtranslate.com/guide/#%E5%AE%89%E8%A3%85) (版本 >= 0.50)，一款 macOS 平台的翻译和 OCR 软件

2. 下载此插件: [openai-translator.bobplugin](https://github.com/vkingw/bob-plugin-local-translator/releases/latest)

3. 安装此插件:
  ![安装步骤](https://user-images.githubusercontent.com/1206493/219937302-6be8d362-1520-4906-b8d6-284d01012837.gif)


## 贡献

如果你想要为 OpenAI Translator Bob Plugin 做出贡献，请阅读[贡献指南](.github/contributing.md)中的说明。我们可以先从这个[列表中的问题](https://github.com/vkingw/bob-plugin-local-translator/contribute)开始。

## 感谢

感谢这个项目，本项目代码 fork 来自这里 [ripperhe](https://github.com/openai-translator/bob-plugin-openai-translator)

我这只是个小小的 Bob 插件，强大的是 Bob 本身，向它的开发者 [ripperhe](https://github.com/ripperhe) 致敬！
