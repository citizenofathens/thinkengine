import os
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

# 영상 리스트 (videoId와 title만 추출)
videos = [
    #  {"videoId": "Bcm5u1", "title": "한국만 있으면 된다는 미국인들"},
    # {"videoId": "iV8oA572BaI", "title": "미국 최연소 1등? 한국에서 또 나온 수학천재"},
    # {"videoId": "rJ4-VIjpL88", "title": "중국 군사력은 한국에 30배? 중국학생이 한국 군사력 무시하다 참교육 받는데"},
    # {"videoId": "KXmbBv3oDGo", "title": "앞으로 11년 뒤, 한국 지도 바뀐다"},
    {"videoId": "XHcuhgK-ODU", "title": "미국도 못 건드는 유일한 나라 한국"},
    {"videoId": "k8DJG0by8pA", "title": "8천만 원 연봉 포기하고 한국행"},
    {"videoId": "DinRxMOrERE", "title": "한국으로 시집가더니 이걸 먹고사니"},
    {"videoId": "ottIIr24P-Y", "title": "한국 아파트가 압도적인 이유"},
    {"videoId": "Bcm5u1-KP4c", "title": "한국 와서 행패 부리던 영국 부대원들"},
    {"videoId": "lZMrd0iTh8M", "title": "옥스퍼드도 못한걸 한국이 해냈다"},
    # {"videoId": vid, "title": ""} for vid in [
        # 'sHkZ27DNe9Q', 'X7I7qiYJV5Y', 'GKH-zRrWcuw', 'YthVqOnYsC0', 'fkbcMduJqcc', '-W1LprR7VtQ', 'WwUgkkS24dM', 'SrVwflJ2w_I', 'PRUCnHEUnto', 'cEtlliL0JSs', '3bpxYd5opC0', 'Lx0mNC3kSM0', 'iugrezwCG2w', '3S8LkcQ32G0', '4yat2GiRfb8', 'OhFXLxBqTus', 'jrlwzpTsTiQ', 'OOEliIP0tVs', 'W59Mh90GBFo', 'avqsIfuBR60', 'wTIiZLZKnPI', 'R7mUCIlpuBk', 'k8AdyjvVdJ8', 'OKPYFCW7Uxo', '_L_AsC1oioU', 'jjhdRh0Xp-I', 'g2mEhokBXOs', 'C6635InKzDo', 'iV8oA572BaI', '6VrS8uUQzrM', 'jBFpwAYk3nw', 'GCdseqT2l0E', 'VwTALszrqB8', '-LVDQB2w10Q', 'pcK29adZSN4', '1EDVbS3-Jrc', 'd2xx7qIlXwE', 'Bcm5u1-KP4c', 'pjq2-1H9yeo', 'j5xwfJyYTys', 'YxT88pJGuCk', 'XHcuhgK-ODU', 'ottIIr24P-Y', '9uZz1vw7L-k', 'a-9QLexGkSw', 'u9gX1sg7JvE', 'gjM9J5BA870', 'TSTA-vECa-k', 'F4O4-KwluO8', 'MacRqvZ8G-c', 'xPnxp9fAjrc', 'KomUlN3sAhA', '8h-B8TFSj-8', 'ie8X7G6t52I', '_WOqmPLEg58', 'E3Og0QsfMG0', 'eojpTr7RPNk', '7xak7x_WQpE', 'YyTVUzJ0a0E', 'yBRCVcJZHLc', '_ebclwagbeo', 'wXuWUGbNRqU', 'O99LGB3uVg0', 'BzAGc_NhBIk', 'E6hg_aPK_LY', '9iSWb2yGEVo', 'LFOgo2VI2ow', 'vncM2WghdZ8', 'rGSUOXLYuvk', 'Y8xNXSPs5Ls', 'ajpJ4K9fNs0'
    # ]
]

# 저장 폴더 생성

output_dir = "youtube_transcripts"
os.makedirs(output_dir, exist_ok=True)

print("폴더 생성 위치:", os.path.abspath(output_dir))
print("폴더가 존재하는가?", os.path.exists(output_dir))
print("폴더 내 파일 목록:", os.listdir(output_dir))

for video in videos:
    video_id = video["videoId"]
    title = video["title"]
    safe_title = "".join(c for c in title if c.isalnum() or c in " _-").rstrip()
    output_path = os.path.join(output_dir, f"{safe_title}_{video_id}.txt")
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['ko', 'en'])
        with open(output_path, "w", encoding="utf-8") as f:
            for entry in transcript:
                f.write(f"{entry['text']}\n")
        print(f"Saved transcript: {output_path}")
    except (TranscriptsDisabled, NoTranscriptFound):
        print(f"Transcript not available for video: {title} ({video_id})")
    except Exception as e:
        print(f"Error for {title} ({video_id}): {e}")