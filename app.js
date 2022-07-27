const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-wavey:JQMjueYqUs6zXOSf@cluster-wavey.wn7co.mongodb.net/todolist?retryWrites=true&w=majority", {useNewUrlParser: true})

const itemSchema = new mongoose.Schema({
  name : String
});

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "yo"
});

const item2 = new Item({
  name: "hit + to ad new item"
})

const defaultItems = [item1, item2];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = new mongoose.model("List", listSchema)

app.get("/", function(req, res) {
  const day = "Today";

  
  Item.find({}, function(err, foundItems){
    
    if (foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
          if(err){
              console.log(err)
          }
          else{
              console.log('success')
          }
      });
      res.redirect("/")
   }
   else{
     res.render("list", {
      listTitle: "today",
      newListItems: foundItems
    });

   }
  })

});

app.get("/:custList", function(req,res){
  const custList = _.capitalize(req.params.custList);

  List.findOne({name: custList}, function(err,foundList){
    if (!err){
      if(!foundList){
        const list = new List({
          name: custList,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + custList)
      }
      else{
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items});
      }
    }
  })

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if (listName === "today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});
 
app.post("/delete", function(req,res){
  const checkedItem = req.body.checkbox
  const listName = req.body.listName

  if (listName === "today") {
    Item.findByIdAndDelete(checkedItem,function(err){
      console.log(err);
    });
    res.redirect("/");
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName)
      }
    })
  }
 
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}



app.listen(port, function() {
  console.log("Server started");
});
