type ConditionalSource<V extends Record<string, string | undefined>> = {
	discriminant: string;
	value: V;
};

export type HostedMediaMetadata = {
	title?: string;
	date?: string;
	description?: string;
};

type VideoPlatform = "youtube" | "vimeo" | "dailymotion" | "hosted";

type AudioPlatform =
	| "spotify"
	| "deezer"
	| "soundcloud"
	| "radio-france"
	| "arte"
	| "hosted";

type HostedSourceValue = {
	url?: string;
	embedUrl?: string;
	src?: string;
	vttSrc?: string;
	title?: string;
	date?: string;
	description?: string;
};

function extractHostedMetadata(
	value: HostedSourceValue,
): HostedMediaMetadata | undefined {
	const metadata: HostedMediaMetadata = {
		title: value.title?.trim() || undefined,
		date: value.date?.trim() || undefined,
		description: value.description?.trim() || undefined,
	};

	return metadata.title || metadata.date || metadata.description
		? metadata
		: undefined;
}

export function resolveVideoSource(props: {
	platform?: VideoPlatform;
	url?: string;
	src?: string;
	source?: ConditionalSource<HostedSourceValue>;
}): {
	platform: VideoPlatform;
	url: string;
	src: string;
	metadata?: HostedMediaMetadata;
} {
	if (props.source) {
		const { discriminant, value } = props.source;
		const platform = discriminant as VideoPlatform;
		return {
			platform,
			url: value.url ?? value.embedUrl ?? "",
			src: value.src ?? "",
			metadata:
				platform === "hosted" ? extractHostedMetadata(value) : undefined,
		};
	}

	return {
		platform: props.platform ?? "youtube",
		url: props.url ?? "",
		src: props.src ?? "",
	};
}

export function resolveAudioSource(props: {
	platform?: AudioPlatform;
	embedUrl?: string;
	src?: string;
	vttSrc?: string;
	source?: ConditionalSource<HostedSourceValue>;
}): {
	platform: AudioPlatform;
	embedUrl: string;
	src: string;
	vttSrc?: string;
	metadata?: HostedMediaMetadata;
} {
	if (props.source) {
		const { discriminant, value } = props.source;
		const platform = discriminant as AudioPlatform;
		return {
			platform,
			embedUrl: value.embedUrl ?? "",
			src: value.src ?? "",
			vttSrc: value.vttSrc,
			metadata:
				platform === "hosted" ? extractHostedMetadata(value) : undefined,
		};
	}

	return {
		platform: props.platform ?? "spotify",
		embedUrl: props.embedUrl ?? "",
		src: props.src ?? "",
		vttSrc: props.vttSrc,
	};
}
