import
 jester,
 asyncdispatch,
 times,
 os,
 httpclient

## The JSONCache object is used to store the Nimble JSON file in memory for a specified amount of time
#  to prevent it from being retrieved every time
type
  JSONCache = ref object of RootObj
    cachedData: string
    lastUpdated: Time
    updateEvery: Time

proc getJSON*(self:JSONCache) : string =
  let timeDiff = int64(getTime() - self.updateEvery);

  if(timeDiff > int64(self.lastUpdated)):
    echo "Retrieving new instance of the JSON file"
    try:
      self.cachedData = getContent("http://raw.githubusercontent.com/nim-lang/packages/master/packages.json")
    except HttpRequestError:
      echo "There was an HTTP request error while trying to retrieve JSON object from github"
      echo getCurrentExceptionMsg()
    self.lastUpdated = getTime()

  result = self.cachedData

let jsonCache = JSONCache(
  cachedData: getContent("http://raw.githubusercontent.com/nim-lang/packages/master/packages.json"),
  lastUpdated: getTime(),
  updateEvery: fromSeconds(60*120) #only pull every two hours
)

routes:

  get "/jsonCache":
    resp(jsonCache.getJSON())

runForever()
