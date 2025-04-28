# 유튜브 채널의 모든 video id를 자동으로 가져오려면 YouTube Data API를 사용하는 것이 가장 확실합니다.
# 아래는 '매억남 요약 - 매요' 채널의 모든 video id를 가져오는 예시 코드입니다.
# (API 키와 채널 ID는 직접 입력해야 합니다.)

from googleapiclient.discovery import build

API_KEY = 'AIzaSyBsGAx37s0I_TTUDvdCB6ubZQ3-EzxyIoQ'  # 본인의 YouTube Data API v3 키로 교체
CHANNEL_ID = 'UCRgEAW8umUwMjz58PVfDrSA'  # 매억남 요약 - 매요 채널 ID

def get_all_video_ids(api_key, channel_id):
    youtube = build('youtube', 'v3', developerKey=api_key)
    video_ids = []
    next_page_token = None

    while True:
        request = youtube.search().list(
            part='id',
            channelId=channel_id,
            maxResults=50,
            type='video',
            pageToken=next_page_token
        )
        response = request.execute()
        for item in response['items']:
            video_ids.append(item['id']['videoId'])
        next_page_token = response.get('nextPageToken')
        if not next_page_token:
            break
    return video_ids

# 사용 예시
if __name__ == "__main__":
    all_video_ids = get_all_video_ids(API_KEY, CHANNEL_ID)
    print(all_video_ids)