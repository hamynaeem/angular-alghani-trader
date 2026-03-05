// Sidebar route metadata
export interface RouteInfo {
    id?: number;
    path: string;
    title: string;
    icon: string;
    class: string;
    badge?: string;
    badgeClass?: string;
    isExternalLink: boolean;
    submenu : RouteInfo[];
    group:any
}
