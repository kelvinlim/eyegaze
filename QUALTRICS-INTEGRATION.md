# Qualtrics Integration Guide (v0.1.9)

This guide explains how to embed the `eyegaze` task into a Qualtrics survey and capture summary statistics automatically.

### 1. Survey Flow Setup
Before addding the script, you must define the following **Embedded Data** fields at the top of your **Survey Flow**:

| Field Name | Description |
| :--- | :--- |
| `EYEGAZE_Data` | **Consolidated results**: A JSON string containing all metrics, trial data, and metadata. |
| `EYEGAZE_Completed` | Set to `Yes` when the task finishes successfully. |

> [!IMPORTANT]
> You no longer need to define individual fields for Accuracy, RT, etc. All metrics are now packed into `EYEGAZE_Data`.

1.  In your survey, create a new **Text/Graphic** question.
2.  Click on the question text and select **HTML View**.
3.  Ensure it is empty or add a simple instruction like "Please wait for the task to load...".
4.  Click on the question and select **JavaScript** from the question options (on the left sidebar).

## Step 3: Add the Integration Script

1.  Open [qualtrics_iframe.js](qualtrics_iframe.js) in your project.
2.  Copy the **entire content** of the file.
3.  Paste it into the `addOnload` section of the Qualtrics JavaScript editor.
4.  **Verify the URL**: Ensure the `task_url` in the script matches your hosted site:
    ```javascript
    var task_url = "https://kelvinlim.github.io/eyegaze/";
    ```
5.  Click **Save**.

## Step 4: Test Your Integration

1.  Publish your survey.
2.  Run the survey link.
3.  Completing the task should automatically:
    - Save your data to the Embedded Data fields.
    - Show a "Task Completed" message.
    - Automatically click the "Next" button to advance the survey.

## Data Analysis

- **`EYEGAZE_Accuracy`**: Represents the percentage of 'Yes' responses for 'Center' gaze trials (standard accuracy check).
- **`EYEGAZE_AvgRT`**: The mean response time in milliseconds.
- **`EYEGAZE_RawData`**: A full JSON string of every trial, which can be exported and analyzed in R or Python.

## Troubleshooting

- **Loading Error**: If the task doesn't load, check that your `task_url` is correct and that your GitHub Pages site is public.
- **Data Not Saving**: Double-check that the Embedded Data field names in your Survey Flow exactly match the list in Step 1.
