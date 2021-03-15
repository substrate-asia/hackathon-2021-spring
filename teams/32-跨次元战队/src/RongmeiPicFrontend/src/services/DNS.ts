import {getBaseUrl} from "@/utils/request";

export async function getServiceBaseUrl(service: string) {
    return getBaseUrl(service);
}
