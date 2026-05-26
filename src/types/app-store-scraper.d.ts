/**
 * Ambient module declaration for `app-store-scraper`.
 *
 * The package ships untyped (`request`-based, last published 2024). We only
 * call the two methods used by `src/lib/sources/app-store.ts`, so we declare
 * just those — the remaining store methods (search, similar, ratings, ...)
 * are unused and intentionally not surfaced. The actual returned shapes are
 * narrowed to the local `RawAppStoreApp` / `RawAppStoreReview` interfaces in
 * the adapter, so `unknown` here is enough to keep tsc happy.
 */
declare module 'app-store-scraper' {
    interface AppLookupOptions {
        id?: number;
        appId?: string;
        country?: string;
        lang?: string;
        ratings?: boolean;
    }

    interface ReviewsLookupOptions {
        id?: number;
        appId?: string;
        country?: string;
        page?: number;
        sort?: string;
    }

    const store: {
        app(options: AppLookupOptions): Promise<unknown>;
        reviews(options: ReviewsLookupOptions): Promise<unknown[]>;
        sort: { RECENT: string; HELPFUL: string };
    };

    export default store;
}
