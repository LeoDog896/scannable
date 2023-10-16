import { renderText } from '../src';
import { createReadStream } from 'fs';
import split from 'split';

const exampleCom = `####### ### ##### #######
#     # #  ## #   #     #
# ### #    ### ## # ### #
# ### # # #   ##  # ### #
# ### # ## #   ## # ### #
#     #   # # #   #     #
####### # # # # # #######
         #  #  ##        
#     ## #  #    #  ## ##
 #  #   ## ##      ## ## 
 ##  #### ##    ## # # ##
#   #  ## ### ## ##      
# ## ##  # ## #  # ## #  
  ###  ########  #  #   #
# # ###  #   #  ## ######
       # ## ###    ## ## 
 ########## ### ######  #
         ###   ##   ###  
####### #  ## ### # ##  #
#     #  ####  ##   #  # 
# ### #  ##  ## ##### ## 
# ### #  ###  ##      # #
# ### #  # #  ####    ## 
#     #  # # ## ## # ### 
####### # ### ##  # #####`;

// import { promises as fs } from "fs"
// import crypto from "crypto"
// await fs.writeFile("./test/resources.txt", "");
// for (let i = 1; i < 4096; i += 10) {
//   const randomStr = crypto.randomBytes(i).toString("hex")

//   const code = renderText({ value: randomStr });

//   await fs.appendFile(`./test/resources.txt`, `${randomStr}:${code}\t`) // seperator is &&\n
// }

const google = `####### ## ## # # #######
#     # ### ### # #     #
# ### # ## #####  # ### #
# ### #   ## #  # # ### #
# ### #  ##   ##  # ### #
#     # #   ##  # #     #
####### # # # # # #######
         #### ###        
##  #####  ##  ### #  ###
# #  # ## # ###  #  #   #
#    ##   #####     ## # 
## ##   #  #  # #  #  # #
   #### ####    ####    #
  #  # ## # ## ## # ## ##
##  ###   ####    ####   
   #   ##### ## #  ##    
 #   ## #####  ######  ##
        #  #   ##   #### 
####### ## ### ## # #    
#     # ## ### ##   # ## 
# ### # #      ######### 
# ### #  ###  ##      # #
# ### #   #   #      #   
#     # ##   #  #   ###  
####### ### ###  #### # #`;

// Weird version edge case
test("Ensure https://google.com works", () => {
  expect(renderText("https://google.com")).toBe(google);
});

test('Ensure base example.com example is valid', () => {
  expect(renderText({ value: 'https://example.com' })).toBe(exampleCom);
});

test('Ensure all resources are valid', (done) => {
  createReadStream('./test/resources.txt', 'utf-8')
    .pipe(split('\t'))
    .on('data', (entry: string) => {
      if (!entry) {
        return;
      }

      const key = entry.split(':')[0];
      const value = entry.split(':')[1];

      expect(renderText({ value: key })).toBe(value);
    })
    .on('close', done);
});

test('Ensure options can be passed to text renderer', () => {
  expect(renderText({
    value: 'https://example.com',
    foregroundChar: '█',
    backgroundChar: ' '
  })).toBe(exampleCom.replaceAll('#', '█'));
});
