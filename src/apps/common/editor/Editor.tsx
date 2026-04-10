import "./editor.css";
import { memo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Box, FormHelperText } from "@mui/material";

function Editor(props: any) {
  const { name, value, setFieldValue, error, touched, placeholder } = props;

  return (
    <Box className="editor-content-main">
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        config={{
          placeholder: placeholder || "Enter content...",
          toolbar: [
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "link",
            "blockQuote",
            "insertTable",
            "undo",
            "redo",
          ],
        }}
        onChange={(_: any, editor: any) => {
          const data = editor.getData();
          setFieldValue(name, data);
        }}
      />

      <FormHelperText className="error-text add-on-error-text">
        {error && touched ? error : null}
      </FormHelperText>
    </Box>
  );
}

export default memo(Editor);
