# Qualtrics Integration Guide (v0.1.9)

This guide explains how to embed the `eyegaze` task into a Qualtrics survey and capture summary statistics automatically.

## Step 1: Set Up Survey Flow (CRITICAL)

Before adding the task, you **must** define the following Embedded Data fields in your Qualtrics Survey Flow. This ensures Qualtrics has a place to store the data sent by the experiment.

1.  Go to **Survey Flow**.
2.  Add a new **Embedded Data** element at the very top of your flow.
3.  Add the following fields (case-sensitive):
    - `EYEGAZE_RawData`
    - `EYEGAZE_TotalTrials`
    - `EYEGAZE_AvgRT`
    - `EYEGAZE_Accuracy`
    - `EYEGAZE_YesCount`
    - `EYEGAZE_NoCount`
    - `EYEGAZE_Completed`

## Step 2: Create the Task Question

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
