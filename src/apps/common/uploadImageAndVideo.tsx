import { Button } from "@mui/material";
import Svg from "../../assets/Svg";

export const renderMultipleImage = (values: any, setFieldValue: any) => {
  const serverImages = values.multipleImageUrl || [];
  const newImages = values.multipleProfile || [];
  const allImages = [
    ...serverImages.map((img: string) => ({
      src: `${import.meta.env.VITE_BASE_URL_IMAGE}/${img}`,
      type: "server",
      id: img,
    })),
    ...newImages.map((file: Blob) => ({
      src: URL.createObjectURL(file),
      type: "new",
    })),
  ];

  const handleRemove = (index: number) => {
    const imgToRemove = allImages[index];
    if (imgToRemove.type === "server") {
      setFieldValue("removedImageIds", [
        ...(values.removedImageIds || []),
        imgToRemove.id,
      ]);
      setFieldValue(
        "multipleImageUrl",
        serverImages.filter((img: string) => img !== imgToRemove.id)
      );
    } else {
      setFieldValue(
        "multipleProfile",
        newImages.filter(
          (_: File, idx: number) => idx !== index - serverImages.length
        )
      );
    }
    // Clear file input so same image can be uploaded again
    const fileInput = document.querySelector<HTMLInputElement>(
      'input[type="file"][accept="image/*"]'
    );
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="multi-image-preview">
      {allImages.map((image, idx) => (
        <div key={idx} className="image-wrapper">
          <img
            className="admin-upload-img"
            src={image.src}
            alt={`preview-${idx}`}
          />
          <span className="remove-icon" onClick={() => handleRemove(idx)}>
            ×
          </span>
        </div>
      ))}

      {allImages?.length < 10 && (
        <Button
          variant="contained"
          component="label"
          className="admin-img-upload-btn"
        >
          <img
            className="admin-upload-cloud-icon"
            src={Svg.uploadIcon}
            alt="upload-icon"
          />
          <input
            hidden
            accept="image/*"
            id="multipleProfile"
            name="multipleProfile"
            type="file"
            multiple
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                setFieldValue("multipleProfile", [
                  ...(values.multipleProfile || []),
                  ...Array.from(files),
                ]);
              }
              e.target.value = "";
            }}
          />
        </Button>
      )}
    </div>
  );
};

export const renderSingleImage = (values: any) => {
  const isUploadImg = values?.imageUrl || values.profile;
  const isImageBlob = values.profile instanceof Blob;
  const imageUrl = values?.imageUrl
    ? `${import.meta.env.VITE_BASE_URL_IMAGE}/${values?.imageUrl}`
    : null;
  let src;

  if (isImageBlob) {
    src = URL.createObjectURL(values.profile);
  } else if (isUploadImg) {
    src = imageUrl;
  } else {
    src = Svg.uploadIcon;
  }

  return (
    <img
      className={isUploadImg ? "admin-upload-img" : "admin-upload-cloud-icon"}
      src={src || Svg.uploadIcon}
      alt="dashboard supplement"
    />
  );
};

export const renderMultipleMedia = (values: any, setFieldValue: any) => {
  const serverImages = values.multipleImageUrl || [];
  const newImages = values.multipleProfile || []; // Files (image or video)

  const allMedia = [
    ...serverImages.map((file: string) => {
      const url = `${import.meta.env.VITE_BASE_URL_IMAGE}/${file}`;
      const extension = file.split(".").pop()?.toLowerCase();
      const type = ["mp4", "mov", "webm"].includes(extension!)
        ? "video"
        : "image";

      return { src: url, type, origin: "server", id: file };
    }),
    ...newImages.map((file: File) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const type = ["mp4", "mov", "webm"].includes(extension!)
        ? "video"
        : "image";

      return { src: URL.createObjectURL(file), type, origin: "new", file };
    }),
  ];

  const handleRemove = (index: number) => {
    const item = allMedia[index];

    if (item.origin === "server") {
      setFieldValue("removedImageIds", [
        ...(values.removedImageIds || []),
        item.id,
      ]);

      setFieldValue(
        "multipleImageUrl",
        serverImages.filter((s: string) => s !== item.id)
      );
    } else {
      const newIndex = index - serverImages.length;
      setFieldValue(
        "multipleProfile",
        newImages.filter((_: File, idx: number) => idx !== newIndex)
      );
    }
  };

  const isMaxReached = allMedia.length >= 10;

  return (
    <div className="multi-image-preview">
      {allMedia.map((media, idx) => (
        <div key={idx} className="image-wrapper">
          {media.type === "image" ? (
            <img className="admin-upload-img" src={media.src} />
          ) : (
            <video
              className="admin-upload-img"
              src={media.src}
              controls
              preload="metadata"
            />
          )}

          <span className="remove-icon" onClick={() => handleRemove(idx)}>
            ×
          </span>
        </div>
      ))}

      {!isMaxReached && (
        <Button
          variant="contained"
          component="label"
          className="admin-img-upload-btn"
        >
          <img
            className="admin-upload-cloud-icon"
            src={Svg.uploadIcon}
            alt="upload"
          />
          <input
            hidden
            accept="image/*,video/*"
            id="multipleProfile"
            type="file"
            multiple
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                setFieldValue("multipleProfile", [
                  ...(values.multipleProfile || []),
                  ...Array.from(files),
                ]);
              }
              e.target.value = "";
            }}
          />
        </Button>
      )}
    </div>
  );
};
