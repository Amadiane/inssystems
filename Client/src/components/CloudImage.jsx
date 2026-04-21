import React from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { fill } from "@cloudinary/url-gen/actions/resize";
import CONFIG from "../config/config.js";



const CloudImage = ({ publicId, width = 400, height = 300 }) => {
  const cld = new Cloudinary({
    cloud: { cloudName: CONFIG.CLOUDINARY_NAME },
  });

  const myImage = cld.image(publicId).resize(fill().width(width).height(height));

  return (
    <AdvancedImage
      cldImg={myImage}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxWidth: "90%",
        maxHeight: "90%",
        objectFit: "cover",
      }}
    />
  );
};

export default CloudImage;
