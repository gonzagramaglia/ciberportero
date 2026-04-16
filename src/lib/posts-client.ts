export interface PostData {
    id: string;
    slug: string;
    title: string;
    date: string;
    description: string;
    content: string;
    availableLangs?: string[];
    countdowns?: any[];
}
