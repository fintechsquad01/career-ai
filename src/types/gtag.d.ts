type GtagConfigParams = {
  page_title?: string;
  page_location?: string;
  page_path?: string;
  send_page_view?: boolean;
  user_id?: string;
  [key: string]: string | number | boolean | undefined | null;
};

type GtagEventParams = Record<string, string | number | boolean | undefined | null>;

interface Window {
  gtag?: (
    command: "config" | "event" | "set" | "js",
    targetIdOrAction: string | Date,
    params?: GtagConfigParams | GtagEventParams,
  ) => void;
  dataLayer?: Array<unknown>;
}
