export interface HashAlgorithmRequest {
  readonly algorithm: string;
}

export interface HashAlgorithmResponse {
  readonly algorithm: string;
  readonly message?: string;
}

export interface HashOfStringRequest {
  readonly input: string;
}

export interface HashOfStringResponse {
  readonly input: string;
  readonly hashOfInput: string;
  readonly hashAlgorithm: string;
}
