/**
 * This module contains a reactive store.
 * The store contains functions that expose, filter, transform, combine or otherwise wrangle the spreadsheet data into submission.
 * The store functions can be used in the website where the data is then displayed.
 * The advantage of using a reactive store: If the data changes, the website is updated automatically!
 */

import * as Api from "./api.js"
import {reactive} from "https://unpkg.com/petite-vue@0.3.0/dist/petite-vue.es.js"

export const store = reactive({
    sourceLanguage: 'deu',

    filter: "",

    data: [],

    refreshing: false,

    get entryList() {
        if (this.filter == "") {
            return this.data;
        }
        if (this.sourceLanguage == "deu") {
            return this.data.filter((entry) => {
                    return contains(entry.definition, this.filter);
            });
        }
        else {
            return this.data.filter((entry) => {
                return contains(entry.word, this.filter) || contains(entry.stem, this.filter);
            }).sort((a, b) => {
                let astem = contains(a.stem, this.filter);
                let bstem = contains(b.stem, this.filter);
                if (astem && !bstem) {
                    return -1
                }
                if (!astem && bstem) {
                    return 1
                }
                if (a.stem != b.stem) {
                    return a.stem < b.stem ? -1 : a.stem > b.stem ? 1 : 0;
                }
                return a.word < b.word ? -1 : a.word > b.word ? 1 : 0;
            });
        }
    },

    changeDir() {
        this.sourceLanguage = this.sourceLanguage == "deu" ? "nae" : "deu"
    },

    updateData(data) {
        this.data = data;
    },

    refreshData() {
        this.refreshing = true;
        Api.clearCache();
        this.init();
    },

    mainStem(stems) {
        return stems.split(";")[0].trim()
    },

    async init() {
        // This will fetch them all in parallel, which is faster.
        await Promise.all([
            Api.fetchData()
                .then(o => this.updateData(o))
        ])
        this.refreshing = false
    }
})


function contains(haystack, needle) {
    let needleN = needle.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
    return haystack.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().includes(needleN)
}
