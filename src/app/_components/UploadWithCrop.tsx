"use client";
import React, { useEffect, useState } from "react";
import { Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import ImgCrop from "antd-img-crop";
import axios, { type AxiosRequestConfig } from "axios";
import { api } from "~/trpc/react";
import { WithUrl } from "~/utils/withUrl";

export type BasicUpload = {
		id?: string;
		key: string;
	};
//Compatible con Antd
//Retorna la url de la imagen
export const UploadWithCrop = ({
	isPublic = false,
	maxFiles = 1,
	value,
	onChange,
}: {
	isPublic?: boolean;
	maxFiles?: number;
	value?: BasicUpload[];
	onChange?: (value: BasicUpload[]) => void;
}) => {
	const [fileList, setFileList] = useState<UploadFile[]>(
		value?.map((v) => ({
			uid: v.id || v.key,
			name: v.key,
			status: "done",
			url: WithUrl(v.key),
		})) || [],
	);
	const [uploadedFiles, setUploadedFiles] = useState<
		{
			id?: string;
			key: string;
		}[]
	>(value ?? []);

	const onPreview = async (file: UploadFile) => {
		let src = file.url!;
		if (!src) {
			src = await new Promise((resolve) => {
				const reader = new FileReader();
				reader.readAsDataURL(file.originFileObj!);
				reader.onload = () => resolve(reader.result as string);
			});
		}
		const image = new Image();
		image.src = src;
		const imgWindow = window.open(src);
		imgWindow?.document.write(image.outerHTML);
	};
	const uapi = api.upload.getUrl.useMutation();
	// useEffect(() => {
	// 	if (value && value.length > 0) {
	// 		setFileList(
	// 			value.map((v) => ({
	// 				uid: v.id || v.key,
	// 				name: v.key,
	// 				status: "done",
	// 				url: WithUrl(v.key),
	// 			})),
	// 		);
	// 	}
	// }, [value]);

	useEffect(() => {
		if (onChange) onChange(uploadedFiles);
	}, [onChange, uploadedFiles]);
	const handleOnChange: UploadProps["onChange"] = (props) => {
		setFileList(props.fileList);
	};
	return (
		<ImgCrop rotationSlider>
			<Upload
				onRemove={(v) => {
					setUploadedFiles(uploadedFiles.filter((f) => f.id !== v.uid));
					setFileList(fileList.filter((f) => f.uid !== v.uid));
				}}
				onChange={handleOnChange}
				maxCount={maxFiles}
				accept="image/*"
				// action={(file) => {
				//   return uapi.mutateAsync({ objectName: file.name });
				// }}
				customRequest={async (options) => {
					const { onSuccess, onError, onProgress } = options;

					//Create a post request which upload with form data
					const fileOptions = options.file as unknown as UploadFile;
					const data = await uapi.mutateAsync({
						objectName: fileOptions.name,
						contentType: fileOptions.type,
						isPublic,
					});
					const formData = new FormData();
					for (const key in data.formData) {
						formData.append(key, data.formData[key] as string);
					}
					formData.append("file", options.file);
					const config: AxiosRequestConfig = {
						headers: { "content-type": "multipart/form-data" },
						onUploadProgress: (progressEvent) => {
							const percent = Math.floor(
								(progressEvent.loaded * 100) / (progressEvent?.total ?? 0),
							);
							if (onProgress) onProgress({ percent });
						},
					};
					try {
						await axios.post(data.postURL, formData, config);
						setUploadedFiles([
							...uploadedFiles,
							{
								id: fileOptions.uid,
								key: `${data.formData.key}`,
							},
						]);
						// Search by uuid and add the key

						if (onSuccess) onSuccess(data.formData.Key);
					} catch (error) {
						const newError = new Error("No se pudo cargar el archivo");
						if (onError) onError(newError);
					}
				}}
				listType="picture-card"
				fileList={fileList}
				onPreview={onPreview}
			>
				{fileList.length < maxFiles && "+ Imagen"}
			</Upload>
		</ImgCrop>
	);
};
