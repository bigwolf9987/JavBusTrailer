export default {
  async fetch(request, env, ctx) {
    if (request.method.toUpperCase() === "POST") {
      const movieInfo = await request.json().catch((e) => null);
      if (!movieInfo) return new Response("");
      let videoURL = await this.queryVideoURLFromKV(env, movieInfo);
      if (!videoURL) {
        //use movieId
        videoURL = await this.queryVideoURLFromDMMOfficial(env, movieInfo, false).catch(
          (e) => ""
        );
      }
      if (!videoURL) {
        //use title
        videoURL = await this.queryVideoURLFromDMMOfficial(env, movieInfo, true).catch(
          (e) => ""
        );
      }
      if (videoURL) {
        await this.saveVideoURLToKV(env, movieInfo, videoURL);
      }
      return new Response(videoURL);
    }
  },
  async queryVideoURLFromDMMOfficial(env, movieInfo, isUseTitle = false) {
    let notFound = () => Promise.reject("DMM Official server not found movie.");
    let keyword = isUseTitle
      ? movieInfo.titleKeyPhrase
      : movieInfo.movieId.replace("-", " ");
    const host = "https://www.dmm.co.jp";
    let serverURL = `${host}/search/=/searchstr=${keyword}/limit=3/sort=rankprofile/`;
    //console.log("DMM Official query:\r\n" + serverURL);
    const headers = new Headers({
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "ja-JP",
      "Sec-Ch-Ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": "macOS",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      "Sec-Fetch-Site": "same-origin",
      Referer: "https://www.dmm.co.jp/top/",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      cookie: "age_check_done=1;ckcy=1;is_intarnal=1;",
    });
    return fetch(serverURL, {
      method: "get",
      headers: headers,
    })
      .then((resp) => {
        return resp.text();
      })
      .then((respText) => {
        //DMM Official search result, may contain multiple movies.
        let resultMovies = this.extractMovieItem(respText);
        let targetMovieEle = null;
        for (const element of resultMovies) {
          if (element.match(/dlsoft\.dmm\.co\.jp/)) continue;
          // if (element.match(/tv\.dmm\.co\.jp/)) continue;
          if (this.matchMovieByKeyword(element, movieInfo)) {
            targetMovieEle = element;
            break;
          }
        }
        if (!targetMovieEle) return notFound();
        let avDetailURL = targetMovieEle.match(/tmb.*?href="(.*?)"/s)?.at(1);
        if (!avDetailURL) return notFound();
        //remove unuse params
        return fetch(avDetailURL.split("?")[0], {
          headers: headers,
        });
      })
      .then((resp) => resp.text())
      .then((avDetailRespText) => {
        //Different link format, get twice.
        let videoIframeURL = avDetailRespText?.match(/data-video-url="(\S*?)"/)?.at(1);
        if (!videoIframeURL) {
          //try again
          videoIframeURL = avDetailRespText?.match(/sampleplay\('(\S*?)'\)/)?.at(1);
        }
        if (!videoIframeURL) return notFound();
        return fetch(host + videoIframeURL, {
          headers: headers,
        });
      })
      .then((resp) => resp.text())
      .then((videoFrameRespText) => {
        let iframeURL = videoFrameRespText?.match(/src="(\S*?)"/)?.at(1);
        if (!iframeURL) return notFound();
        return fetch(iframeURL, {
          headers: headers,
        });
      })
      .then((resp) => resp.text())
      .then((videoRespText) => {
        let videoURL = videoRespText?.match(/args.*?src":"(.*?)"/)?.at(1);
        //TODO get different quality
        // bitrate.*?720.*?src":"(.*?)"
        if (videoURL) {
          videoURL = "https:" + videoURL.replaceAll("\\", "");
          return videoURL;
        }
        return notFound();
      })
      .catch((e) => {
        return Promise.reject(e);
      });
  },

  async queryVideoURLFromKV(env, movieInfo) {
    try {
      return await env.KV_NAMESPACE.get(movieInfo.movieId).catch((e) => null);
    } catch (error) {
      return null;
    }
  },

  async saveVideoURLToKV(env, movieInfo, videoURL) {
    return await env.KV_NAMESPACE.put(movieInfo.movieId, videoURL);
  },
  extractMovieItem(text) {
    const matches = text.match(/<ul id="list">(.*?)<\/ul>/s);
    if (!matches) return [];
    return matches.at(1).match(/<li>(.*?)<\/li>/gs);
  },

  matchMovieByKeyword(str, movieInfo) {
    if (str.indexOf(movieInfo.movieId) != -1 || str.indexOf(movieInfo.title) != -1) {
      return true;
    }
    if (str.indexOf(movieInfo.titleKeyPhrase) != -1) {
      return true;
    }
    if (
      this.findDifference(movieInfo.titleKeyPhrase, this.removeWhitespace(str)).length < 4
    ) {
      return true;
    }
    return false;
  },

  getKeyPhrase(str, splitChar = " ") {
    return str
      .split(splitChar)
      .reduce((pre, cur) => (cur?.length > pre.length ? cur : pre), "");
  },

  findDifference(str1, str2) {
    const len = Math.min(str1.length, str2.length);
    const result = [];
    for (let i = 0; i < len; i++) {
      if (str1[i] !== str2[i]) {
        result.push(str1[i]);
        str1 = this.replaceChar(str1, i, str2[i]);
      }
    }
    return result;
  },

  replaceChar(str, index, newChar) {
    const leftPart = str.slice(0, index);
    const rightPart = str.slice(index + 1);
    return leftPart + newChar + rightPart;
  },

  removeWhitespace(str) {
    return str.replace(/\s/g, "");
  },
};
