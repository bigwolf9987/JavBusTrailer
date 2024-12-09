export default {
  settings: {
    enable_debug_mode: false,
    video_quality: 720, //视频清晰度,可设置为下列值之一：1080；720；480；360；240；144；（注：数值越大越清晰，所需网络加载时间越长）
  },

  corporations: {
    stars: ["1"],
    star: ["1"],
    svdvd: ["1"],
    sdde: ["1"],
    mogi: ["1"],
    dvdes: ["1"],
    fset: ["1"],
    rct: ["1"],
    abp: ["118"],
    ppt: ["118"],
    dv: ["53"],
    mds: ["84"],
    gvg: ["13"],
    haru: ["h_687"],
    sdnm: ["1"],
    scpx: ["84"],
    dldss: ["1"],
    spro: ["h_1594", "00"],
    silkc: ["1", "00"],
    hzgb: ["h_1100"],
    awd: [""],
    drpt: ["1"],
    hz: ["h_113"],
    pym: ["h_283"],
    fone: ["h_491"],
    stcv: ["h_1616", "00"],
    ftht: ["1", "00"],
    apns: [""],
    dvaj: [""],
    t28: ["55"],
    lol: ["12", "00"],
    vema: [""],
    venx: [""],
    skmj: ["h_1324"],
    fsvr: ["h_955", "00"],
    dtvr: ["24", "00"],
    pydvr: ["h_1321", "00"],
    hoks: [""],
    sqis: [""],
    real: [""],
    urkk: [""],
    bazx: [""],
    mdbk: [""],
    mdtm: [""],
    mkmp: [""],
    saba: [""],
    scop: [""],
    spz: ["h_254"],
    udak: ["h_254"],
    jukf: ["h_227"],
    shind: ["h_1560", "00"],
    ovg: [""],
    shh: ["1", "00"],
    shn: ["1", "00"],
    dandy: ["1"],
    sw: ["1"],
    meko: ["h_1160", "00"],
    apaa: [""],
    ekdv: [""],
    nhdtb: ["1"],
    umd: ["125"],
    sdab: ["1"],
    sdjs: ["1"],
    sdmf: ["1"],
    sdmm: ["1"],
    sdmua: ["1"],
    rebd: ["h_346"],
    sdth: ["1"],
    aran: [""],
    aed: [""],
    anb: [""],
    cmv: [""],
    piyo: ["1"],
    rctd: ["1"],
    fgan: ["h_1440", "00"],
    zex: ["h_720"],
    fera: ["h_086", "00"],
    fuga: ["h_086", "00"],
    mtall: ["1", "00"],
    fsdss: ["1"],
    ofku: ["h_254"],
    nsfs: ["", "00"],
    sdmu: ["1"],
    sinn: [""],
    hkd: [""],
    rvg: [""],
    scd: [""],
    ktra: ["h_094", "00"],
    jrze: ["h_086", "00"],
    mesu: ["h_086", "00"],
    akdl: ["1", "00"],
    wo: ["1"],
    sun: ["1"],
    gvh: [""],
    vec: [""],
    gma: [""],
    supa: ["h_244"],
    bobb: [""],
    focs: [""],
    tppn: [""],
    abw: ["118"],
    pkpd: [""],
    adn: ["", "00"],
    wkd: ["2", "00"],
    aarm: [""],
    sqte: [""],
    flav: [""],
    jsop: [""],
    bda: [""],
    tki: ["h_286"],
    nacr: ["h_237"],
    kire: ["1"],
    docp: ["118"],
    jksr: ["57"],
    hgot: ["84"],
    mcsr: ["57"],
  },

  async fetch(request, env, ctx) {
    if (request.method.toUpperCase() != "POST") {
      return new Response("Bad Request", { status: 400 });
    }

    try {
      const movieInfo = await request.json();

      if (!this.validateRequestParams(movieInfo)) {
        return new Response(String("Required parameters format error"), { status: 400 });
      }

      let videoURL = await this.getVideoURL(env, movieInfo);
      if (!videoURL) {
        return new Response(String("Not found trailer"), { status: 404 });
      }

      if (movieInfo.isNewRecord) {
        this.log(`🚀 ~ Deno.serve ~ isNewRecord:${movieInfo.isNewRecord}`);
        this.log(`🚀 ~ Deno.serve ~ videoURL:${videoURL}`);
        await this.saveVideoURLToKV(env, movieInfo, videoURL);
      }

      return new Response(String(videoURL), {
        headers: { "Content-Type": "text/plain; charset=UTF-8" },
        status: 200,
      });
    } catch (err) {
      console.log("err:" + String(err?.message ?? err));
      return new Response(String(err?.message ?? err), { status: 404 });
    }
  },

  async getVideoURL(env, movieInfo) {
    movieInfo.isNewRecord = false;
    let videoURL = await this.queryVideoURLFromKV(env, movieInfo)
      .catch((e) => {
        this.log(e);
        movieInfo.isNewRecord = true;
        return this.queryVideoURLFromDMMOfficial(movieInfo, false);
      })
      .catch((e) => {
        this.log(e);
        return this.queryDMMVideoURL(movieInfo, undefined, false, "mhb");
      })
      .catch((e) => {
        this.log(e);
        return this.queryDMMVideoURL(movieInfo);
      })
      .catch((e) => {
        this.log(e);
        return this.queryDMMVideoURL(movieInfo, undefined, true);
      })
      .catch((e) => {
        this.log(e);
        return this.queryPrestigeVideoURL(movieInfo);
      })
      .catch((e) => {
        this.log(e);
        return this.queryMGStageVideoURL(movieInfo);
      })
      .catch((e) => {
        this.log(e);
        return this.queryMGStageVideoURL(movieInfo, false, true);
      })
      .catch((e) => {
        this.log(e);
        //retry query (use movie title as keyword)
        return this.queryMGStageVideoURL(movieInfo, true);
      })
      .catch((e) => {
        this.log(e);
        return this.queryXCityVideoURL(movieInfo);
      })
      .catch((e) => {
        this.log(e);
        return this.queryBasicUncensoredVideoURL(movieInfo);
      })
      .catch((e) => {
        this.log(e);
        return this.queryTokyoHotVideoURL(movieInfo);
      })
      .catch((e) => {
        this.log(e);
        return this.queryAVFantasyVideoURL(movieInfo);
      })
      .catch((e) => {
        this.log(e);
        return this.queryAVFantasyVideoURL(movieInfo, true);
      })
      .catch((e) => {
        this.log(e);
      });
    return this.convertHTTPToHTTPS(videoURL);
  },

  async queryVideoURLFromKV(env, movieInfo) {
    try {
      const data = await env.KV_NAMESPACE.get(movieInfo.movieId);

      if (!data) {
        return Promise.reject("Cloudflare KV not found movie.");
      }
      this.log("Cloudflare KV result video url: " + data);
      return data;
    } catch (err) {
      this.log(err);
      return Promise.reject("Cloudflare KV not found movie.");
    }
  },

  async saveVideoURLToKV(env, movieInfo, videoURL) {
    try {
      await env.KV_NAMESPACE.put(movieInfo.movieId, videoURL);
      return true;
    } catch (err) {
      this.log("Save video url to KV error:" + err);
      return false;
    }
  },

  async queryDMMVideoURL(
    movieInfo,
    host = "cc3001.dmm.co.jp",
    hasPrefix = false,
    postfix = "_dmb_w"
  ) {
    if (movieInfo.isUncensored)
      return Promise.reject("DMM server not support uncensored movie.");
    //? 又支持 MGStage 了
    // if (movieInfo.thumbnailURL?.includes("mgstage.com"))
    //   return Promise.reject("DMM server not support MGStage movie.");
    //see https://www.javbus.com/forum/forum.php?mod=viewthread&tid=63374
    //see https://bit.ly/3wXLj6T
    let infix = "litevideo/freepv";
    //1500kbps = _dmb_w || 3000kbps = _mhb_w || vrlite || _sm_w.mp4 || _dm_w.mp4 || _dmb_s.mp4!!
    // let postfix = "_dmb_w";
    if (movieInfo.isVR) {
      postfix = "vrlite";
      infix = "vrsample";
    }
    let movieIdSplit = movieInfo.movieId.toLowerCase().split("-");
    let corp = movieIdSplit[0];
    let idNum = movieIdSplit[1];
    let videoURL = `https://${host}/${infix}/${corp[0]}/${corp.substring(
      0,
      3
    )}/${corp}${idNum}/${corp}${idNum}${postfix}.mp4`;

    if (hasPrefix === false && movieInfo.thumbnailURL?.includes("pics.dmm.co.jp")) {
      //extract keyword from thumbnail
      //example: https://pics.dmm.co.jp/digital/video/mkmp00497/mkmp00497jp-2.jpg
      //result keyword: mkmp00497
      let keywordFromThumbnail = movieInfo.thumbnailURL
        ?.split("video/")[1]
        ?.split("/")[0];
      //validation
      if (keywordFromThumbnail?.includes(corp) && keywordFromThumbnail?.includes(idNum)) {
        videoURL = `https://${host}/${infix}/${
          keywordFromThumbnail[0]
        }/${keywordFromThumbnail.substring(
          0,
          3
        )}/${keywordFromThumbnail}/${keywordFromThumbnail}${postfix}.mp4`;
      }
    }

    if (hasPrefix === true) {
      if (this.corporations[corp]) {
        //There must first get the idNum, and then get corp. Because corp will change.
        idNum = this.corporations[corp][1] ? this.corporations[corp][1] + idNum : idNum;
        corp = this.corporations[corp][0] + corp;
      } else {
        //if last time query is fail, this time try to add '00' prefix
        if (!movieInfo.thumbnailURL?.includes("pics.dmm.co.jp")) {
          idNum = "00" + idNum;
        }
      }
      videoURL = `https://${host}/${infix}/${corp[0]}/${corp.substring(
        0,
        3
      )}/${corp}${idNum}/${corp}${idNum}${postfix}.mp4`;
    }

    this.log("DMM server query:\r\n" + videoURL);

    return await fetch(videoURL, {
      method: "head",
      headers: {
        "accept-language": "ja-JP",
        cookie: "age_check_done=1;",
        "referrer-policy": "no-referrer",
      },
    })
      .then((resp) => {
        if (resp.ok) {
          this.log("DMM server result video url: " + videoURL);
          return videoURL;
        } else {
          return Promise.reject("DMM server not found movie.");
        }
      })
      .catch((e) => {
        return Promise.reject(e);
      });
  },

  async queryVideoURLFromDMMOfficial(movieInfo, isUseTitle = false) {
    if (movieInfo.isUncensored)
      return Promise.reject("DMM Official server not support uncensored movie.");
    let notFound = () => Promise.reject("DMM Official server not found movie.");
    let keyword = isUseTitle
      ? movieInfo.titleKeyPhrase
      : movieInfo.movieId.replaceAll("-", "%20");
    const host = "https://www.dmm.co.jp";
    let serverURL = `${host}/search/=/searchstr=${keyword}/limit=3/sort=rankprofile/`;
    this.log(`DMM Official query:${serverURL}`);
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
      Host: "www.dmm.co.jp",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      cookie: "age_check_done=1; ckcy=1; is_intarnal=1; domain=dmm.co.jp; path=/;",
    });
    return fetch(serverURL, {
      method: "get",
      headers: headers,
    })
      .then((resp) => resp.text())
      .then((respText) => {
        //DMM Official search result, may contain multiple movies.
        let resultMovies = this.extractDMMMovieItem(respText);
        if (!resultMovies) return notFound();
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
        let avDetailURL = targetMovieEle.match(/tmb.*?href="(\S*?)"/s)?.at(1);
        if (!avDetailURL) return notFound();
        //remove unuse params
        return fetch(avDetailURL.split("?")[0], {
          headers: headers,
        });
      })
      .then((resp) => resp.text())
      .then((avDetailRespText) => {
        //Different link format, get twice.
        let videoIframeURL = avDetailRespText?.match(/data-video-url="(\S*?)"/s)?.at(1);
        if (!videoIframeURL) {
          //try again
          videoIframeURL = avDetailRespText?.match(/sampleplay\('(\S*?)'\)/s)?.at(1);
        }
        if (!videoIframeURL) return notFound();
        return fetch(host + videoIframeURL, {
          headers: headers,
        });
      })
      .then((resp) => resp.text())
      .then((videoFrameRespText) => {
        let iframeURL = videoFrameRespText?.match(/src="(\S*?)"/s)?.at(1);
        if (!iframeURL) return notFound();
        return fetch(iframeURL, {
          headers: headers,
        });
      })
      .then((resp) => resp.text())
      .then((videoRespText) => {
        let videoURL = videoRespText?.match(/args.*?src":"(\S*?)"/s)?.at(1);
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

  async queryMGStageVideoURL(movieInfo, isUseTitle = false, isUseThumbnail = false) {
    if (
      movieInfo.isUncensored ||
      (movieInfo.corpName.includes("プレステージ") === false &&
        movieInfo.corpName.includes("ラグジュTV") === false &&
        movieInfo.corpName.toUpperCase().includes("PRESTIGE") === false &&
        !movieInfo.thumbnailURL?.includes("mgstage.com") &&
        !movieInfo.thumbnailURL?.includes("prestige-av.com"))
    )
      return Promise.reject(
        `MGStage server not support movieId: ${movieInfo.movieId}, CorpName: ${movieInfo.corpName}`
      );
    let notFound = () => Promise.reject("MGStage server not found movie.");

    let keyword = isUseTitle ? movieInfo.titleKeyPhrase : movieInfo.movieId;

    if (isUseThumbnail && movieInfo.thumbnailURL?.includes("image.mgstage.com")) {
      //extract keyword from thumbnail
      //example: https://image.mgstage.com/images/hmp/002aidv/0003/cap_e_1_002aidv-0003.jpg
      //result keyword: 002aidv-0003
      let keywordFromThumbnail = movieInfo.thumbnailURL
        .match(new RegExp(`([\\da-zA-Z]*?${movieInfo.movieId})`, "i"))
        ?.at(1);

      if (keywordFromThumbnail?.toUpperCase() === movieInfo.movieId.toUpperCase()) {
        return Promise.reject("MGStage server : keywordFromThumbnail equals movieId.");
      }
      if (keywordFromThumbnail) {
        keyword = keywordFromThumbnail;
      }
    }
    //Need ladder
    let serverURL = `https://www.mgstage.com/search/cSearch.php?search_word=${keyword}&list_cnt=30`;
    this.log("MGStage server query:\r\n" + serverURL);
    const headers = {
      "accept-language": "ja-JP",
      cookie: "coc=1;adc=1",
      "referrer-policy": "no-referrer",
    };

    return await fetch(serverURL, {
      method: "get",
      headers: headers,
    })
      .then((resp) => resp.text())
      .then((respText) => {
        //MGStage search result, may contain multiple movies.
        let resultMovies = this.extractMGStageMovieItem(respText);
        if (!resultMovies) return notFound();
        let targetMovieEle = null;
        for (const element of resultMovies) {
          if (this.matchMovieByKeyword(element, movieInfo)) {
            targetMovieEle = element;
            break;
          }
        }
        if (!targetMovieEle) return notFound();
        let avDetailURL = targetMovieEle
          .match(/<a href="(\S*?)"\s*?class="button_sample">/s)
          ?.at(1);
        if (!avDetailURL) return notFound();
        let pid = avDetailURL.split("/").at(-1);
        return fetch(
          "https://www.mgstage.com/sampleplayer/sampleRespons.php?pid=" + pid,
          {
            method: "get",
            headers: headers,
          }
        );
      })
      .then((avDetailResp) => {
        if (!avDetailResp.ok) return notFound();
        return avDetailResp.json();
      })
      .then((respJsonData) => {
        //MGStage movie detail page result.
        let videoURL = respJsonData?.url?.split(".ism")[0] + ".mp4";
        if (videoURL) {
          this.log("MGStage server result video url: " + videoURL);
          return videoURL;
        }
        return notFound();
      })
      .catch((e) => {
        return Promise.reject(e);
      });
  },

  async queryPrestigeVideoURL(movieInfo, isUseTitle = false) {
    if (
      movieInfo.isUncensored ||
      (movieInfo.corpName.includes("プレステージ") === false &&
        movieInfo.corpName.toUpperCase().includes("PRESTIGE") === false &&
        !movieInfo.thumbnailURL?.includes("mgstage.com") &&
        !movieInfo.thumbnailURL?.includes("prestige-av.com"))
    )
      return Promise.reject(
        `Prestige server not support movieId: ${movieInfo.movieId}, CorpName: ${movieInfo.corpName}`
      );
    let notFound = () => Promise.reject("Prestige server not found movie.");
    let keyword = isUseTitle ? movieInfo.titleKeyPhrase : movieInfo.movieId;
    let serverURL = `https://www.prestige-av.com/api/search?isEnabledQuery=true&searchText=${keyword}&isEnableAggregation=false&release=false&reservation=false&soldOut=false&from=0&aggregationTermsSize=0&size=20`;
    this.log("Prestige server query:\r\n" + serverURL);
    return await fetch(serverURL, { method: "get" })
      .then((resp) => {
        if (!resp.ok) return notFound();
        return resp.json();
      })
      .then((respJsonData) => {
        let resultMovies = respJsonData?.hits?.hits;
        if (!resultMovies) return notFound();
        for (const movieDetail of resultMovies) {
          let { deliveryItemId, productTitle, productMovie } = movieDetail["_source"];
          if (
            this.matchMovieByKeyword(deliveryItemId + productTitle, movieInfo) &&
            productMovie?.path
          ) {
            let videoURL = "https://www.prestige-av.com/api/media/" + productMovie.path;
            this.log("Prestige server result video url: " + videoURL);
            return videoURL;
          }
        }
        return notFound();
      })
      .catch((e) => {
        return Promise.reject(e);
      });
  },

  //XCity 的预览视频比较短，时长固定在90秒，不如 DMM 官网的视频
  async queryXCityVideoURL(movieInfo, isUseTitle = false) {
    if (movieInfo.isUncensored)
      return Promise.reject(
        `XCity server not support movieId: ${movieInfo.movieId}, CorpName: ${movieInfo.corpName}`
      );
    let notFound = () => Promise.reject("XCity server not found movie.");

    let keyword = isUseTitle
      ? movieInfo.titleKeyPhrase
      : movieInfo.movieId.replaceAll("-", ""); //must remove dash
    //Need ladder
    let serverURL = `https://xcity.jp/result_published/?genre=%2Fresult_published%2F&q=${keyword}&sg=main&num=30`;
    this.log("XCity server query:\r\n" + serverURL);
    const headers = {
      "accept-language": "ja-JP",
      cookie: "pagenum=30;",
      Referer:
        "https://xcity.jp/result_published/?genre=%2Fresult_published%2F&q=XCITY%E3%82%AA%E3%83%AA%E3%82%B8%E3%83%8A%E3%83%AB&sg=main&num=30",
      "Sec-Fetch-Site": "same-origin",
    };

    return await fetch(serverURL, {
      method: "get",
      headers: headers,
    })
      .then((resp) => resp.text())
      .then((respText) => {
        //XCity search result, may contain multiple movies.
        let resultMovies = respText?.match(
          /<td>\s*?(<a href="\S*?id=\S*?">.*?<\/a>)\s*?<\/td>/gs
        );
        if (!resultMovies) return notFound();
        let targetMovieEle = null;
        for (const element of resultMovies) {
          const innerText = element.match(/">(.*?)<\/a>/s)?.at(1);
          if (this.matchMovieByKeyword(innerText, movieInfo)) {
            targetMovieEle = element;
            break;
          }
        }
        if (!targetMovieEle) return notFound();
        let avDetailURL = targetMovieEle.match(/href="(\S*?)"/s)?.at(1);
        if (!avDetailURL) return notFound();
        return fetch(`https://xcity.jp${avDetailURL}`, {
          method: "get",
          headers: headers,
        });
      })
      .then((resp) => resp.text())
      .then((avDetailRespText) => {
        //XCity movie detail page result.
        let videoURL = avDetailRespText?.match(/name="src" value="(\S*?)"/s)?.at(1);
        if (videoURL) {
          this.log("XCity server result video url: " + videoURL);
          return videoURL;
        }
        return notFound();
      })
      .catch((e) => {
        return Promise.reject(e);
      });
  },

  async queryBasicUncensoredVideoURL(movieInfo) {
    if (!movieInfo.isUncensored)
      return Promise.reject("Query basic uncensored only support uncensored movie.");
    let videoURLs;
    const qualityArr = ["720p.mp4", "1080p.mp4", "480p.mp4", "360p.mp4", "240p.mp4"];
    if (
      movieInfo.corpName === "カリビアンコム" ||
      movieInfo.corpName.toUpperCase() === "CARIBBEANCOM"
    ) {
      //create different quality video urls.
      videoURLs = qualityArr.map(
        (quality) =>
          `https://smovie.caribbeancom.com/sample/movies/${movieInfo.movieId}/${quality}`
      );
    } else if (
      movieInfo.corpName === "東京熱" ||
      movieInfo.corpName.toUpperCase() === "TOKYOHOT"
    ) {
      videoURLs = [`https://my.cdn.tokyo-hot.com/media/samples/${movieInfo.movieId}.mp4`];
    } else if (
      movieInfo.corpName === "天然むすめ" ||
      movieInfo.corpName.toUpperCase() === "10MUSUME"
    ) {
      videoURLs = qualityArr.map(
        (quality) =>
          `https://smovie.10musume.com/sample/movies/${movieInfo.movieId}/${quality}`
      );
    } else if (
      movieInfo.corpName === "一本道" ||
      movieInfo.corpName.toUpperCase() === "1PONDO"
    ) {
      videoURLs = qualityArr.map(
        (quality) =>
          `https://smovie.1pondo.tv/sample/movies/${movieInfo.movieId}/${quality}`
      );
      videoURLs.push(
        `https://ppvclips02.aventertainments.com/01m3u8/1pon_${movieInfo.movieId}/1pon_${movieInfo.movieId}.m3u8`
      );
    } else if (
      movieInfo.corpName === "ワンピース" ||
      movieInfo.corpName === "オリエンタルドリーム" ||
      movieInfo.corpName.toUpperCase() === "ONEPIECEENTERTAINMENT" ||
      movieInfo.corpName.toUpperCase() === "ORIENTALDREAM"
    ) {
      videoURLs = [
        `https://ppvclips02.aventertainments.com/${movieInfo.movieId}/ts/${movieInfo.movieId}-m3u8-aapl.ism/manifest(format=m3u8-aapl).m3u8`,
      ];
    } else if (
      movieInfo.corpName === "パコパコママ" ||
      movieInfo.corpName.toUpperCase() === "PACOPACOMAMA"
    ) {
      videoURLs = qualityArr.map(
        (quality) =>
          `https://fms.pacopacomama.com/hls/sample/pacopacomama.com/${movieInfo.movieId}/${quality}`
      );
    } else {
      return Promise.reject(
        "Query basic uncensored: This function not support this corporation movie."
      );
    }
    for (const videoURL of videoURLs) {
      this.log("Query basic uncensored:\r\n" + videoURL);
      const validatedURL = await fetch(videoURL, { method: "head" })
        .then((resp) => {
          if (resp.ok) {
            this.log("Query basic uncensored: server result video url: " + videoURL);
            return videoURL;
          }
          return null;
        })
        .catch((e) => {
          this.log(e);
          return null;
        });
      if (validatedURL) {
        return Promise.resolve(validatedURL);
      }
    }
    return Promise.reject("Query basic uncensored Not found movie.");
  },

  async queryTokyoHotVideoURL(movieInfo) {
    if (
      !movieInfo.isUncensored ||
      (movieInfo.corpName != "東京熱" && movieInfo.corpName.toUpperCase() != "TOKYOHOT")
    )
      return Promise.reject(
        `TokyoHot server not support movieId: ${movieInfo.movieId}, CorpName: ${movieInfo.corpName}`
      );
    let notFound = () => Promise.reject("TokyoHot server not found movie.");
    //Need ladder
    let serverURL = `https://my.cdn.tokyo-hot.com/product/?q=${movieInfo.movieId}`;
    this.log("TokyoHot server query:\r\n" + serverURL);
    return await fetch(serverURL, { method: "get" })
      .then((resp) => resp.text())
      .then((respText) => {
        //search result, may contain multiple movies.
        let resultMovies = this.extractTokyoHotMovieItem(respText);
        if (!resultMovies) return notFound();
        let targetMovieEle = null;
        for (const element of resultMovies) {
          if (this.matchMovieByKeyword(element, movieInfo)) {
            targetMovieEle = element;
            break;
          }
        }
        if (!targetMovieEle) return notFound();
        let avDetailURL = targetMovieEle.match(/<a href="(\S*?)" class="rm">/s)?.at(1);
        if (!avDetailURL) return notFound();
        return fetch("https://my.cdn.tokyo-hot.com/" + avDetailURL, { method: "get" });
      })
      .then((resp) => resp.text())
      .then((respText) => {
        //detail page result
        let videoSource = respText.match(/<source.*?src="(\S*?)"/s)?.at(1);
        //! if (videoSource && videoSource != location.href) { 与 location.href 的判断条件在什么情况下出现？
        if (videoSource) {
          this.log("Tokyo server result video url: " + videoSource);
          return videoSource;
        }
        return notFound();
      })
      .catch((e) => {
        return Promise.reject(e);
      });
  },

  //? AVFantasy 比片商的预告片短半分钟
  async queryAVFantasyVideoURL(movieInfo, isStandbyServer = false) {
    if (!movieInfo.isUncensored)
      return Promise.reject("AVFantasyDMM server only support uncensored movie.");
    let notFound = () => Promise.reject("AVFantasy server not found movie.");
    let keyword = movieInfo.movieId;
    //Movie codes for these companies are not supported, so use movie titles to search.
    if (movieInfo.corpName.toUpperCase() === "HEYZO") {
      keyword = movieInfo.titleKeyPhrase;
    }
    let serverURL = `https://www.avfantasy.com/ppv/ppv_searchproducts.aspx?keyword=${keyword}`;
    if (isStandbyServer) {
      serverURL = `https://www.avfantasy.com/search_Products.aspx?keyword=${keyword}`;
    }
    this.log("AVFantasyDMM server query:\r\n" + serverURL);
    return await fetch(serverURL, { method: "get" })
      .then((response) => response.text())
      .then((respText) => {
        //AVFantasy search result, may contain multiple movies.
        let resultMovies = this.extractAVFantasyMovieItem(respText);
        if (!resultMovies) return notFound();
        let targetMovieEle = null;
        for (const element of resultMovies) {
          if (this.matchMovieByKeyword(element, movieInfo)) {
            targetMovieEle = element;
            break;
          }
        }
        if (!targetMovieEle) return notFound();
        let avDetailURL = targetMovieEle.match(/<a href="(\S*?)"/s)?.at(1);
        if (!avDetailURL) return notFound();
        return fetch(avDetailURL, { method: "get" });
      })
      .then((response) => response.text())
      .then((respText) => {
        //AVFantasy movie detail page result.
        let videoSource = respText.match(/<source.*?src="(\S*?)"/s)?.at(1);
        if (videoSource) {
          this.log("AVFantasy server result video url: " + videoSource);
          return videoSource;
        }
        return notFound();
      })
      .catch((e) => {
        return Promise.reject(e);
      });
  },

  validateRequestParams(movieInfo) {
    if (
      !movieInfo.title ||
      /^.{1,250}$/su.test(movieInfo.title) === false ||
      !movieInfo.movieId ||
      /^.{1,50}$/su.test(movieInfo.movieId) === false ||
      !movieInfo.corpName ||
      /^.{1,80}$/su.test(movieInfo.corpName) === false ||
      !movieInfo.hasOwnProperty("isVR") ||
      typeof movieInfo.isVR !== "boolean" ||
      !movieInfo.hasOwnProperty("isUncensored") ||
      typeof movieInfo.isUncensored !== "boolean"
    ) {
      console.log("Invalid request params failed: " + JSON.stringify(movieInfo));
      return false;
    }

    if (
      movieInfo.thumbnailURL &&
      /^\S{10,250}$/su.test(movieInfo.thumbnailURL) === false
    ) {
      this.log("Invalid thumbnail url failed: " + movieInfo.thumbnailURL);
      return false;
    }

    // set title key phrase
    let titleKeyPhrase = this.getKeyPhrase(movieInfo.title);
    // retry extract
    if (titleKeyPhrase === movieInfo.title)
      titleKeyPhrase = this.getKeyPhrase(movieInfo.title, "！！");

    movieInfo.titleKeyPhrase = titleKeyPhrase;

    this.log(movieInfo);
    return true;
  },

  convertHTTPToHTTPS(url) {
    if (url?.startsWith("http:")) {
      return url.replace("http:", "https:");
    }
    return url;
  },

  extractDMMMovieItem(text) {
    const matches = text.match(/<ul id="list">(.*?)<\/ul>/s);
    if (!matches) return [];
    return matches.at(1).match(/<li>(.*?)<\/li>/gs);
  },

  extractMGStageMovieItem(text) {
    const matches = text.match(/<div class="rank_list">\s*<ul>(.*?)<\/ul>/s);
    if (!matches) return [];
    return matches.at(1).match(/<li>(.*?)<\/li>/gs);
  },

  extractTokyoHotMovieItem(text) {
    return text.match(/<li class="detail">(.*?)<\/li>/gs);
    // const matches = text.match(/<ul class="list slider cf">(.*?)<\/ul>/s);
    // if (!matches) return [];
    // return matches.at(1).match(/<li.*?>(.*?)<\/li>/gs);
  },

  extractAVFantasyMovieItem(text) {
    return text.match(/<div class="single-slider-product.*?>(.*?)<\/div>\s*?<\/div>/gs);
  },

  matchMovieByKeyword(str, movieInfo) {
    const st1 = str.toLowerCase();
    const titleKeyPhrase = movieInfo.titleKeyPhrase.toLowerCase();
    const movieId = movieInfo.movieId.toLowerCase();
    const title = movieInfo.title.toLowerCase();
    if (st1.indexOf(movieId) != -1 || st1.indexOf(title) != -1) {
      return true;
    }
    if (this.jaroWinklerDistance(title, st1) >= 0.86) {
      return true;
    }
    if (st1.indexOf(titleKeyPhrase) != -1) {
      return true;
    }
    if (this.findDifference(titleKeyPhrase, this.removeWhitespace(st1)).length < 4) {
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

  log(msg) {
    if (this.settings.enable_debug_mode) {
      if (typeof msg === "object") {
        console.dir(msg);
      } else {
        console.log(msg);
      }
    }
  },

  //Jaro-Winkler算法是一种专门用于计算短字符串相似度的算法,对于拼写错误更加容忍
  //返回值在0到1之间,值越大表示两个字符串越相似。
  jaroWinklerDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;

    if (m === 0 || n === 0) {
      return 0;
    }

    const maxDistance = Math.floor(Math.max(m, n) / 2) - 1;
    let match = 0;
    const str1Matched = Array(m).fill(false);
    const str2Matched = Array(n).fill(false);

    // 计算匹配字符数
    for (let i = 0; i < m; i++) {
      const start = Math.max(0, i - maxDistance);
      const end = Math.min(i + maxDistance + 1, n);

      for (let j = start; j < end; j++) {
        if (str2Matched[j] === false && str1[i] === str2[j]) {
          str1Matched[i] = true;
          str2Matched[j] = true;
          match++;
          break;
        }
      }
    }

    if (match === 0) {
      return 0;
    }

    // 计算字符串的传输
    let t = 0;
    let point = 0;
    for (let i = 0; i < m; i++) {
      if (str1Matched[i]) {
        while (str2Matched[point] === false) {
          point++;
        }
        if (str1[i] !== str2[point]) {
          t++;
        }
        point++;
      }
    }

    t /= 2;

    // 计算Jaro-Winkler距离
    const jaroDistance = (match / m + match / n + (match - t) / match) / 3;

    // 如果两个字符串前缀相同,增加前缀分数
    let prefixLength = 0;
    for (let i = 0; i < Math.min(m, n); i++) {
      if (str1[i] === str2[i]) {
        prefixLength++;
      } else {
        break;
      }
    }
    prefixLength = Math.min(4, prefixLength);

    const jaro_winkler = jaroDistance + 0.1 * prefixLength * (1 - jaroDistance);

    return jaro_winkler;
  },
};
