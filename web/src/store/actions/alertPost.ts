import { createAction } from "@reduxjs/toolkit";
import { AlertData } from "../../model/types";

/**
 * Post a transient alert in the application header
 */
const alertPost = createAction<AlertData>("alert/post");
export default alertPost;