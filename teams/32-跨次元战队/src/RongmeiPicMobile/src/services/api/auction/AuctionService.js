import {http} from "../HttpService";

export class AuctionServiceImpl {
    async getSale(id) {
        return http.get(`auction/sale/${id}`);
    }

    async getSales(parameters) {
        return http.post(`auction/sale/query`, parameters);
    }

    async getMineSales() {
        return http.get(`auction/sale/mine`);
    }

    async bid(price, id) {
        return http.post(`auction/bid`, {
            price,
            saleId: id
        });
    }

    async getSaleHistory(id) {
        return http.get(`auction/history/${id}`);
    }

    async getOwnerArtworks(authorName) {
        return http.get(`auction/thing/owner?owner=${authorName}`);
    }

    async getAuthorArtworks(authorName) {
        return http.get(`auction/thing/author?author=${authorName}`);
    }

    async getAuctionTransactionHistory() {
        return http.get(`auction/transaction/history/mine`);
    }

    async getTopTags(startTime, endTime) {
        return http.get(`auction/statistics/tag?startTime=${startTime}&endTime=${endTime}`)
    }

    async getTopArtist(params) {
        return http.get(`auction/artist?limit=${params.limit}&offset=${params.offset}`)
    }

    async getAuctionTransactionHistories(params) {
        return http.get(`auction/transaction/current?limit=${params.limit}&offset=${params.offset}`)
    }

    async getThingByTokenId(tokenId) {
        return http.get(`auction/thing/token/${tokenId}`);
    }

    async getStatistics() {
        return http.get(`auction/statistics`);
    }

    async getAuctionTopic(key, offset, limit) {
        return http.get(`auction/sale/topic?key=${key}&offset=${offset}&limit=${limit}`);
    }

    async getMineSalesParticipate() {
        return http.get(`auction/sale/participate/mine`);
    }

    async getMineThings() {
        return http.get(`auction/thing/mine`);
    }

    async getThings() {
        return http.get(`auction/thing`);
    }

    async getThing(thingId) {
        return http.get(`auction/thing/${thingId}`);
    }

    async getFavoritesThings(favoritesId, status) {
        return http.get(`auction/favorites?favorites_id=${favoritesId}&status=${status}`);
    }

    async getToken(tokenId) {
        return http.get(`auction/token/${tokenId}`);
    }

    async updateSale(saleData) {
        return http.post(`auction/sale`, saleData)
    }
}
