import
 jester,
 asyncdispatch

routes:
  get "/":
    redirect("/index.html")

runForever()
